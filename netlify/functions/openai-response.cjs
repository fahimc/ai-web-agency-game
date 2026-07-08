const ALLOWED_MODELS = new Set([
  'gpt-5.4-mini',
  'gpt-5.4',
  'gpt-5.5',
  'gpt-4.1-mini',
  'gpt-4.1',
]);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    return json(500, { error: 'Studio service is not configured yet.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const model = String(body.model || '').trim();
  const input = Array.isArray(body.input) ? body.input : null;
  if (!ALLOWED_MODELS.has(model)) return json(400, { error: 'Model is not allowed for this project.' });
  if (!input?.length) return json(400, { error: 'Missing model input.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input }),
    });
    const text = await response.text();
    if (!response.ok) {
      return json(response.status, { error: `Model call failed (${response.status}): ${text.slice(0, 700)}` });
    }

    const data = JSON.parse(text);
    return json(200, { output_text: parseResponseText(data), raw: data });
  } catch (error) {
    return json(500, { error: error?.message || 'Studio request failed.' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

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
