const express = require('express');
const aws = require('aws-sdk');
const url = require('url');

const Snapshot = require('../models/Snapshot');
const SnapshotDiff = require('../models/SnapshotDiff');
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

const streamObject = (imageLocation, req, res) => {
  const key = url.parse(imageLocation).path.split('/').slice(2).join('/');

  const stream = s3.getObject({
    Bucket: settings.s3.screenshotBucket,
    Key: key,
  }).createReadStream();

  stream.on('error', err => res.status(400).json({error: err.message}));

  stream.pipe(res);
};

router.get('/diff/:diffId', async (req, res) => {
  const { diffId } = req.params;
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(404);
  }

  const snapshotDiff = await SnapshotDiff.query().findById(diffId);
  if (!(await snapshotDiff.canRead(req.user))) {
    return res.status(404);
  }
  streamObject(snapshotDiff.imageLocation, req, res);
});

router.get('/:snapshotId', async (req, res) => {
  const { snapshotId } = req.params;
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(404);
  }

  const snapshot = await Snapshot.query().findById(snapshotId);
  if (!(await snapshot.canRead(req.user))) {
    return res.status(404);
  }
  streamObject(snapshot.imageLocation, req, res);
});

module.exports = router;