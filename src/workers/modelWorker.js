import { reviewAssetsPrompt } from '../utils/reviewAssets.js';

function toOutputText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toOutputText).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    if (typeof value.output_text === 'string') return value.output_text;
    if (typeof value.text === 'string') return value.text;
    if (typeof value.value === 'string') return value.value;
    if (typeof value.content === 'string') return value.content;
    if (value.content) return toOutputText(value.content);
    if (value.message) return toOutputText(value.message);
    if (value.result) return toOutputText(value.result);
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function parseResponseText(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data.output_text === 'string') return data.output_text;
  if (typeof data.text === 'string') return data.text;
  if (data.result) return toOutputText(data.result);
  if (data.message) return toOutputText(data.message);
  const pieces = [];
  const outputs = Array.isArray(data.output) ? data.output : [];
  outputs.forEach((item) => {
    if (Array.isArray(item.content)) {
      item.content.forEach((content) => {
        const text = toOutputText(content && (content.text || content.output_text || content.content || content));
        if (text) pieces.push(text);
      });
    } else {
      const text = toOutputText(item && (item.text || item.output_text || item.content));
      if (text) pieces.push(text);
    }
  });
  return pieces.join('\n').trim() || toOutputText(data);
}

self.onmessage = async (event) => {
  const { id, payload } = event.data;
  try {
    const { employee, task, context, settings, state, complex } = payload;
    const model = state.projectModel || settings.selectedModel || (complex ? settings.complexModel : settings.fastModel);
    const system = [
      `You are ${employee.name}, the ${employee.role} inside MicroAgency AI, a playful autonomous web agency.`,
      `Personality and working style: ${employee.voice}.`,
      'Produce real, useful agency deliverables. Be specific, commercial and practical. Output only the requested deliverable.',
    ].join(' ');
    const user = [
      `Autonomy mode: ${settings.autonomy}`,
      `Client contact: ${state.userName || 'Unknown'}${state.email ? ` <${state.email}>` : ''}`,
      `Project intake form / brief: ${state.clientDetails || state.brief || 'Not provided'}`,
      state.reviewAssets?.length ? `Client supplied files and context:\n${reviewAssetsPrompt(state.reviewAssets)}` : '',
      context ? `Context from previous employees:\n${context}` : '',
      `Task:\n${task}`,
    ].filter(Boolean).join('\n\n');
    const requestPayload = { model, input: [{ role: 'system', content: system }, { role: 'user', content: user }] };
    const response = await fetch('/.netlify/functions/openai-response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestPayload) });
    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Model call failed (${response.status}): ${errText.slice(0, 700)}`);
    }
    self.postMessage({ id, result: parseResponseText(await response.json()) || '' });
  } catch (error) {
    self.postMessage({ id, error: error?.message || String(error) });
  }
};
