const express = require('express');

const s3 = require('../utils/s3config');
const settings = require('../settings');

const router = express.Router();

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