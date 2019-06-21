const unescape = str =>
  (str + '==='.slice((str.length + 3) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');

const escape = str =>
  str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const encode = (str, encoding) =>
  escape(Buffer.from(str, encoding || 'utf8').toString('base64'));
const decode = (str, encoding) =>
  Buffer.from(unescape(str), 'base64').toString(encoding || 'utf8');

module.exports = {
  unescape,
  escape,
  encode,
  decode,
};
