const PACKAGE_PRICES = {
  launch: { id: 'launch', label: 'Launch Site', modelId: 'gpt-5.4-mini', priceGbp: 1 },
  growth: { id: 'growth', label: 'Growth Site', modelId: 'gpt-5.4', priceGbp: 3 },
  signature: { id: 'signature', label: 'Signature Site', modelId: 'gpt-5.5', priceGbp: 5 },
};

const MODEL_TO_PACKAGE = Object.values(PACKAGE_PRICES).reduce((next, item) => {
  next[item.modelId] = item.id;
  return next;
}, {});

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function paypalClientId() {
  return process.env.PAYPAL_CLIENT_ID || '';
}

function paypalSecret() {
  return process.env.PAYPAL_CLIENT_SECRET || '';
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function packagePrice(packageIdOrModelId) {
  const packageId = PACKAGE_PRICES[packageIdOrModelId] ? packageIdOrModelId : MODEL_TO_PACKAGE[packageIdOrModelId];
  return PACKAGE_PRICES[packageId] || PACKAGE_PRICES.launch;
}

function modelPrice(modelId) {
  return packagePrice(modelId);
}

async function paypalAccessToken() {
  const clientId = paypalClientId();
  const secret = paypalSecret();
  if (!clientId || !secret) throw new Error('PayPal credentials are not configured.');
  const token = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`PayPal token request failed: ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

module.exports = {
  json,
  modelPrice,
  packagePrice,
  paypalAccessToken,
  paypalBaseUrl,
  paypalClientId,
};
