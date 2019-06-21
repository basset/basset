const crypto = require('crypto');
const settings = require('../../settings');

const getToday = () => new Date();

const daysBetween = date =>
  Math.round((date - new Date(2001, 1, 1)) / (1000 * 60 * 60 * 24));

const getHash = (user, timestamp) =>
  `${user.id}${user.updatedAt.getTime()}${timestamp}`;

const compareHmac = (a, b) =>
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

const generateToken = user => {
  const timestamp = daysBetween(getToday());
  return generateTokenWithTimestamp(user, timestamp);
};

const generateTokenWithTimestamp = (user, timestamp) => {
  const timestamp36 = timestamp.toString(36);

  const hash = crypto
    .createHmac('sha1', settings.secret)
    .update(getHash(user, timestamp))
    .digest('hex')
    .slice(-20);
  return `${timestamp36}-${hash}`;
};

const compareToken = (user, token) => {
  if (!user || !token) {
    return false;
  }
  const [ts36] = token.split('-');

  if (!ts36) {
    return false;
  }

  const timestamp = parseInt(ts36, 36);

  const generatedToken = generateTokenWithTimestamp(user, timestamp);
  let isEqual;
  try {
    isEqual = compareHmac(generatedToken, token);
  } catch (error) {
    return false;
  }
  if (!isEqual) {
    return false;
  }
  if (daysBetween(getToday()) - timestamp > 7) {
    return false;
  }
  return true;
};

module.exports = {
  generateToken,
  compareToken,
};
