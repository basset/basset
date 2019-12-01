const Project = require('../models/Project');
const Build = require('../models/Build');
const BuildAsset = require('../models/BuildAsset');

const getToken = req => {
  const { authorization } = req.headers;
  if (!authorization || authorization.slice(0, 6) !== 'Token ') {
    return null;
  }
  return authorization.slice(6);
};

const getBuildId = req => {
  return req.headers['x-build-id'];
};

const getAssetsPath = (relativePath, sha) => {
  const ext = relativePath.split('.').slice(-1)[0];
  return `${sha}.${ext}`;
};

const getProject = async req => {
  const token = getToken(req);
  if (!token) {
    return false;
  }
  const project = await Project.query()
    .joinRelation('organization')
    .eager('organization')
    .where('key', token)
    .first();

  if (!project) {
    return false;
  }
  return project;
};

const checkBuild = async (req, res, next) => {
  let error = false;
  let build;
  const token = getToken(req);
  const buildId = getBuildId(req);
  if (!buildId) {
    error = 'Invalid build';
  } else if (!token) {
    error = 'Invalid token';
  }
  if (!error) {
    build = await Build.query()
      .joinRelation('project')
      .joinRelation('organization')
      .eager('organization')
      .eager('project')
      .where('project.key', token)
      .where('build.id', buildId)
      .first();

    if (!build) {
      error = 'Invalid build';
    }
    if (await build.organization.snapshotLimitExceeded()) {
      error = 'Monthly snapshot limit exceeded';
    }
  }

  if (error) {
    return res.status(403).json({ error });
  }
  /**
   * an asset can be parsed before its dependencies are uploaded
   * we use relativePath and sha to determine its location
   */
  const buildAssets = await BuildAsset.query()
    .eager('asset')
    .joinRelation('asset')
    .where('buildAsset.buildId', buildId);

  const assets = buildAssets.map(buildAsset => ({
    relativePath: buildAsset.relativePath,
    sha: buildAsset.asset.sha,
  }));

  req.locals = {
    build,
    assets,
  };
  next();
};

module.exports = {
  checkBuild,
  getProject,
  getBuildId,
  getToken,
  getAssetsPath,
};
