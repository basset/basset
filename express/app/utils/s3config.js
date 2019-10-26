const aws = require('aws-sdk');
const settings = require('../settings');

const config = {
  endpoint: settings.s3.endpoint,
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4',
};

if (settings.s3.accessKeyId && settings.s3.secretAccessKey) {
  config.accessKeyId = settings.s3.accessKeyId;
  config.secretAccessKey = settings.s3.secretAccessKey;
}

module.exports = new aws.S3(config);
