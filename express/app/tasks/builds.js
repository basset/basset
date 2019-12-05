const Build = require('../models/Build');

const buildTimeout = 20 * 60 * 1000; // 20 minutes

const checkBuild = async (build) => {
  let lastUpdated = build.updatedAt;
  const now = new Date();
  const lastSnapshot = await build
    .$relatedQuery('snapshots')
    .orderBy('updatedAt', 'desc')
    .first();

  if (lastSnapshot) {
    lastUpdated = lastSnapshot.updatedAt;
  }

  const timeDelta = now - lastUpdated;
  if (timeDelta > buildTimeout) {
    console.error(
      `[checkBuilds] Build (id: ${build.id}) has timed out. There were${
        lastSnapshot ? '' : ' no'
      } snapshots created.`,
    );
    await build.$query().update({
      error: true,
    });
  }

  return true;
};

const monitorBuildStatus = async ({ buildId }) => {
  const build = await Build.query().findById(buildId);
  if (build.error || build.completedAt) {
    return;
  }
  if (await checkBuild(build)) {
    return;
  }
  setTimeout(async () => {
    await monitorBuildStatus({ buildId });
  }, 60 * 1000); // 60 seconds
};

module.exports = {
  monitorBuildStatus,
  checkBuild,
};
