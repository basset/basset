const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime-types');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

const { getAssetsPath } = require('./build');
const transformer = require('./stream-transformer');
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
const s3 = new aws.S3(config);

const assetsUrl = settings.s3.privateAssets ? `/snapshot_source` : `${settings.s3.endpoint}/${settings.s3.assetsBucket}`;

const createBucket = async bucket => {
  try {
    await s3.createBucket({ Bucket: bucket }).promise();
  } catch (error) {
    console.log('there was an error creating the bucket!');
    console.error(error);
    throw error;
  }
};

const checkBucket = async bucket => {
  console.log('checking bucket exists');
  try {
    await s3.headBucket({ Bucket: bucket }).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      console.error('Bucket doesnt exist, creating!');
      createBucket(bucket);
      return;
    }
    throw error;
  }
};

const getSnapshotContentType = (req, file, cb) => {
  const build = req.locals.build;
  const url = `${assetsUrl}/${build.organizationId}/${build.projectId}/assets`;
  const relativePath = req.headers['x-relative-path'];
  const currentPath = relativePath
    .split('/')
    .slice(0, -1)
    .join('/');
  const stream = transformer.transformHTML(req.locals.assets, url, currentPath);
  cb(null, 'text/html', file.stream.pipe(stream));
};
const getSnapshotKey = (req, file, cb) => {
  const build = req.locals.build;
  const randomValue = crypto.randomBytes(16).toString('hex');
  const relativePath = req.headers['x-relative-path'] || 'base';
  let key = `${build.organizationId}/${build.projectId}/${
    build.id
  }/${relativePath}/${randomValue}.html`;
  console.log(`uploading: ${key}`);

  cb(null, key);
};

const uploadSnapshot = multer({
  storage: multerS3({
    s3: s3,
    bucket: settings.s3.assetsBucket,
    contentType: getSnapshotContentType,
    key: getSnapshotKey,
  }),
});

const getAssetContentType = (req, file, cb) => {
  const build = req.locals.build;
  const url = `${assetsUrl}/${build.organizationId}/${build.projectId}/assets`;
  let stream;
  const relativePath = req.headers['x-relative-path'];
  const currentPath = relativePath
    .split('/')
    .slice(0, -1)
    .join('/');

  const mimeType = mime.lookup(file.originalname);
  if (mimeType === 'text/css') {
    stream = transformer.transformCSS(req.locals.assets, url, currentPath);
    cb(null, mimeType || 'text/plain', file.stream.pipe(stream));
  } else {
    cb(null, mimeType || 'text/plain');
  }
};

const getAssetKey = (req, file, cb) => {
  const build = req.locals.build;
  const relativePath = req.headers['x-relative-path'];
  const sha = req.headers['x-sha'];
  if (!relativePath || !sha) {
    cb('Invalid headers');
    return;
  }
  const assetPath = getAssetsPath(relativePath, sha);
  const key = `${build.organizationId}/${build.projectId}/assets/${assetPath}`;
  console.log(`uploading: ${key}`);
  cb(null, key);
};

const uploadAsset = multer({
  storage: multerS3({
    s3: s3,
    bucket: settings.s3.assetsBucket,
    contentType: getAssetContentType,
    key: getAssetKey,
  }),
});

const deleteFile = async (bucket, key) => {
  try {
    await s3
      .deleteObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
  } catch (error) {
    throw error;
  }
};

const copySnapshotDiffToFlake = async (snapshotDiff, snapshot) => {
  const sourceKey = snapshotDiff.imageLocation.replace(
    `${settings.s3.endpoint}`,
    '',
  );
  const uuid = uuidv4();
  const key = `${snapshot.organizationId}/${snapshot.projectId}/flakes/${
    snapshot.title
  }/${snapshot.width}/${uuid}.png`;
  await s3
    .copyObject({
      Bucket: settings.s3.screenshotBucket,
      CopySource: sourceKey,
      Key: key,
    })
    .promise();
  return `${settings.s3.endpoint}/${settings.s3.screenshotBucket}/${key}`;
};

module.exports = {
  uploadSnapshot,
  uploadAsset,
  deleteFile,
  checkBucket,
  createBucket,
  getAssetContentType,
  getAssetKey,
  getSnapshotContentType,
  getSnapshotKey,
  copySnapshotDiffToFlake,
};
