export function toOutputText(value) {
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

export function cleanHTML(text) {
  let value = String(text || '').trim();
  value = value.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
  const doctypeIndex = value.toLowerCase().indexOf('<!doctype html');
  if (doctypeIndex > -1) value = value.slice(doctypeIndex);
  const htmlIndex = value.toLowerCase().indexOf('<html');
  if (doctypeIndex === -1 && htmlIndex > -1) value = `<!doctype html>\n${value.slice(htmlIndex)}`;
  if (!/^<!doctype html/i.test(value) && /<body[\s>]/i.test(value)) value = `<!doctype html>\n${value}`;
  return value;
}

export function extractEmail(text) {
  const match = String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}

export function safeFileName(value) {
  return String(value || 'output')
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '_')
    .replace(/@/g, '_at_')
    .replace(/\.+/g, '.')
    .slice(0, 80) || 'output';
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(anchor.href);
    anchor.remove();
  }, 100);
}

export function friendlyPauseText(reason) {
  const value = String(reason || '');
  if (/openai api key|api key|proxy url missing|not configured/i.test(value)) return 'OpenAI is not configured on Netlify yet. Add OPENAI_API_KEY in Netlify environment variables, redeploy, then press Resume work.';
  if (/network|failed to fetch|offline|connection/i.test(value)) return 'The connection dropped. Your session is saved locally. Reconnect, then press Resume work.';
  if (/model call failed|401|403|429|500|502|503/i.test(value)) return 'The AI request failed. Check the Netlify function logs or wait a moment, then press Resume work.';
  return 'Something interrupted the run. Your session is saved locally. Fix the issue if needed, then press Resume work.';
}

export function phaseLabel(phase) {
  const labels = {
    choice: 'Customer type',
    name: 'Welcome',
    returning_email: 'Load saved job',
    project_choice: 'Choose project',
    email: 'Contact details',
    new_email: 'Contact details',
    new_details: 'Project form',
    brief: 'Project form',
    payment: 'Payment',
    running: 'Agency working',
    approval: 'Preview approval',
    complete: 'Complete',
    error: 'Paused',
  };
  return labels[phase] || phase;
}

export function needsChat(state) {
  return ['name', 'returning_email', 'project_choice', 'email', 'new_email', 'approval', 'error'].includes(state.phase) && !state.running;
}

export function canResumeProject(state) {
  if (!state || state.running || state.phase === 'approval' || state.phase === 'complete') return false;
  if (state.phase === 'error') return true;
  return Boolean(state.brief && ['running', 'brief'].includes(state.phase));
}
