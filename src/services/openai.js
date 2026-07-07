import { getApiKey } from './storage.js';
import { toOutputText } from '../utils/text.js';

export async function callModel({ employee, task, context, settings, state, signal, complex }) {
  const apiKey = getApiKey();
  const model = complex ? settings.complexModel : settings.fastModel;
  if (!apiKey && !settings.proxyUrl) {
    throw new Error('OpenAI API key or proxy URL missing. Open Menu > Settings, add your key, then press Resume work.');
  }

  const system = [
    `You are ${employee.name}, the ${employee.role} inside MicroAgency AI, a playful autonomous web agency.`,
    `Personality and working style: ${employee.voice}.`,
    'Produce real, useful agency deliverables. Be specific, commercial and practical. Output only the requested deliverable.',
  ].join(' ');

  const user = [
    `Autonomy mode: ${settings.autonomy}`,
    `Client email: ${state.email}`,
    `Client/company details: ${state.clientDetails || 'Not provided'}`,
    `Client brief: ${state.brief}`,
    context ? `Context from previous employees:\n${context}` : '',
    `Task:\n${task}`,
  ].filter(Boolean).join('\n\n');

  const payload = { model, input: [{ role: 'system', content: system }, { role: 'user', content: user }] };
  const headers = { 'Content-Type': 'application/json' };
  let url = 'https://api.openai.com/v1/responses';

  if (settings.proxyUrl) {
    url = settings.proxyUrl.trim();
    payload.apiKey = apiKey || undefined;
    payload.openaiPayload = { model, input: payload.input };
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Model call failed (${response.status}): ${errText.slice(0, 700)}`);
  }

  return parseResponseText(await response.json()) || '';
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
