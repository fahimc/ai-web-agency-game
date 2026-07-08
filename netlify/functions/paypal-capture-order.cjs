const { json, packagePrice, paypalAccessToken, paypalBaseUrl } = require('./_paypal.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    if (!body.orderId) return json(400, { error: 'Missing PayPal order ID.' });
    const accessToken = await paypalAccessToken();
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(body.orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) return json(response.status, { error: data.message || 'PayPal capture failed.', details: data });
    const purchase = data.purchase_units?.[0];
    const packageId = purchase?.payments?.captures?.[0]?.custom_id || body.packageId || purchase?.custom_id || body.modelId || 'launch';
    const price = packagePrice(packageId);
    return json(200, {
      id: data.id,
      status: data.status,
      packageId: price.id,
      modelId: price.modelId,
      amountGbp: price.priceGbp,
      details: data,
    });
  } catch (error) {
    return json(500, { error: error.message || 'PayPal capture failed.' });
  }
};
