var aws = require('aws-sdk');
const util = require('util');

const settings = require('../app/settings');

const s3 = new aws.S3({
  accessKeyId: settings.s3.accessKeyId,
  secretAccessKey: settings.s3.secretAccessKey,
  endpoint: settings.s3.endpoint,
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4',
});

const listBuckets = util.promisify(s3.listBuckets).bind(s3);
const getBucketPolicy = util.promisify(s3.getBucketPolicy).bind(s3);
const putBucketPolicy = util.promisify(s3.putBucketPolicy).bind(s3);
const deleteBucketPolicy = util.promisify(s3.deleteBucketPolicy).bind(s3);

const assetsBucket = settings.s3.assetsBucket;
const snapshotsBucket = settings.s3.snapshotsBucket;

const createBucket = async bucket => {
  try {
    await s3.createBucket({ Bucket: bucket }).promise();
  } catch (error) {
    console.log(error);
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
      console.log('Bucket doesnt exist, creating!');
      createBucket(bucket);
      return;
    }
    throw error;
  }
};

const checkPolicy = async bucket => {
  try {
    const policy = await getBucketPolicy({ Bucket: bucket });
    console.log(policy);
  } catch (error) {
    console.log(error);
    if (error.code === 'NoSuchBucketPolicy') {
      await updatePolicy(bucket);
      return;
    }
    console.error(error);
  }
};

const updatePolicy = async bucket => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AddPerm',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };
  const data = await putBucketPolicy({
    Bucket: bucket,
    Policy: JSON.stringify(policy),
  });
  console.log(data);
};

const main = async () => {
  let findBuckets = [snapshotsBucket, assetsBucket];
  //checkBucket(snapshotsBucket);
  //checkBucket(assetsBucket);
  const data = await listBuckets();
  for (const bucket of data.Buckets) {
    if (findBuckets.includes(bucket.Name)) {
      findBuckets = findBuckets.filter(b => b === bucket.Name);
      await checkPolicy(bucket.Name);
    }
  }
};

main();
