const Asset = require('../../app/models/Asset');
const BuildAsset = require('../../app/models/BuildAsset');
const crypto = require('crypto');

const createAsset = async (
  project,
  sha = crypto.randomBytes(20).toString('hex'),
  args = {},
) => {
  return Asset.query().insertAndFetch({
    sha,
    projectId: project.id,
    organizationId: project.organizationId,
    ...args,
  });
};

const createBuildAsset = async (
  relativePath,
  location,
  build,
  project,
  args = {},
) => {
  const asset = await createAsset(project, undefined, { location });
  const buildAsset = await BuildAsset.query().insertAndFetch({
    assetId: asset.id,
    buildId: build.id,
    relativePath,
    organizationId: build.organizationId,
    ...args,
  });
  buildAsset.asset = asset;
  return buildAsset;
};

module.exports = {
  createAsset,
  createBuildAsset,
};
