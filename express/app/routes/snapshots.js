const express = require('express');
const aws = require('aws-sdk');
const url = require('url');
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
const router = express.Router();
const s3 = new aws.S3(config);


router.get('*', async (req, res) => {
  const { token } = req.query;
  if (token !== settings.token) {
    return res.send(404);
  }
  const key = req.params[0];
  const stream = s3.getObject({
    Bucket: settings.s3.assetsBucket,
    Key: key,
  }).createReadStream();

  stream.on('error', err => res.status(400).json({error: err.message}));

  return stream.pipe(res);
});

module.exports = router;