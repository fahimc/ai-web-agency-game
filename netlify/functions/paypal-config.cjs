const { json, paypalClientId } = require('./_paypal.cjs');

exports.handler = async () => {
  const clientId = paypalClientId();
  return json(200, {
    configured: Boolean(clientId),
    clientId,
    currency: 'GBP',
  });
};
