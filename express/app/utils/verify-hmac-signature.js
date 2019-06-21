const crypto = require('crypto');

const settings = require('../settings');

const verifySignature = (signature, body) => {
  console.log('received hmac', signature);
  const hmac = crypto
    .createHmac('sha256', settings.token)
    .update(JSON.stringify(body))
    .digest('hex');
  console.log('hmac', hmac);
  return hmac === signature;
};

module.exports = {
  verifySignature,
};
