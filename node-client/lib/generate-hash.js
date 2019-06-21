const fs = require('fs');
const crypto = require('crypto');

const generateFileHash = filePath => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    try {
      const stream = fs.ReadStream(filePath);
      stream.setEncoding('utf8');
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
    } catch (error) {
      reject(`Error generating SHA1 hash of: ${filePath}`);
    }
  });
};

const generateHash = content => {
  return crypto
    .createHash('sha1')
    .update(content)
    .digest('hex');
};

module.exports = {
  generateFileHash,
  generateHash,
};
