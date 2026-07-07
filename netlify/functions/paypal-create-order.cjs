const { json, modelPrice, paypalAccessToken, paypalBaseUrl } = require('./_paypal.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    const modelId = body.modelId || 'gpt-5.4-mini';
    const price = modelPrice(modelId);
    const accessToken = await paypalAccessToken();
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: `MicroAgency AI project - ${price.label}`,
          custom_id: modelId,
          amount: {
            currency_code: 'GBP',
            value: price.priceGbp.toFixed(2),
          },
        }],
      }),
    });
    const data = await response.json();
    if (!response.ok) return json(response.status, { error: data.message || 'PayPal order creation failed.', details: data });
    return json(200, { id: data.id, amountGbp: price.priceGbp, modelId, label: price.label });
  } catch (error) {
    return json(500, { error: error.message || 'PayPal order creation failed.' });
  }
};
