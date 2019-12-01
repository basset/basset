const url = require('url');
const { ref } = require('objection');

const Organization = require('../models/Organization');
const Build = require('../models/Build');
const BuildAsset = require('../models/BuildAsset');
const Asset = require('../models/Asset');
const settings = require('../settings');
const s3 = require('../utils/s3config');

const deleteFiles = async (bucket, keysToDelete) => {
  let keys = keysToDelete.slice(0, 1000);
  let count = 1000;
  while (keys.length > 0) {
    const params = {
      Bucket: bucket,
      Delete: {
        Objects: keys,
      },
    };
    await s3.deleteObjects(params).promise();
    keys = keysToDelete.slice(count, count += 1000)
  }
};

const getKeys = locations => locations.map(location => url
  .parse(location)
  .path.split('/')
  .slice(2)
  .join('/'),
);

const run = async () => {
  console.log('[removeSnapshotData] clearing old snapshot data');

  const organizations = await Organization.query().where('enforceBuildRetention', true);
  for await (const organization of organizations.values()) {
    const retentionLimit = new Date();
    retentionLimit.setDate(retentionLimit.getDate() - organization.buildRetentionPeriod);

    // for now we remove old snapshot source data and assets from storage
    const snapshots = await Build
      .query()
      .select('snapshots.sourceLocation')
      .joinRelation('snapshots')
      .where('build.organizationId', organization.id)
      .where('build.createdAt', '<', retentionLimit);

    let keys = getKeys(snapshots.map(snapshot => snapshot.sourceLocation));

    const assets = await Asset
      .query()
      .distinct('location')
      .innerJoinRelation('buildAssets')
      .where('asset.organizationId', organization.id)
      .where('asset.createdAt', '<', retentionLimit)
      .whereRaw(
        '? < ?',
        [
          BuildAsset.raw(
            BuildAsset.query().max('createdAt').where('buildAsset.assetId', ref('asset.id')),
          ).wrap('(', ')'),
          retentionLimit,
        ],
      );

    keys = [
      ...keys,
      ...getKeys(assets.map(asset => asset.location)),
    ];
    console.log(`[removeSnapshotData] found ${keys.length} snapshots and assets to remove`)
    await deleteFiles(settings.s3.assetsBucket, keys);
  }
  console.log('[removeSnapshotData] complete');
  await destroy();
};

module.exports = run;