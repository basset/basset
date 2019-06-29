const Build = require('../models/Build');

const buildTimeout = 20 * 60 * 1000; // 20 minutes

const monitorBuildStatus = async ({ buildId }) => {
  const build = await Build.query().findById(buildId);
  if (build.error || build.completedAt) {
    return;
  }
  let lastUpdated = new Date();
  const lastSnapshot = await build
    .$relatedQuery('snapshots')
    .orderBy('updatedAt', 'desc')
    .first();

  if (lastSnapshot) {
    lastUpdated = lastSnapshot.updatedAt;
  }

  const timeDelta = lastUpdated - build.updatedAt;
  if (timeDelta > buildTimeout) {
    console.error(`Build (id: ${build.id}) has timed out. There were${lastSnapshot ? '' : ' no'} snapshots created.`);
    await build.$query().update({
      error: true,
    });
    return;
  }
  setTimeout(async () => {
    await monitorBuildStatus({ buildId });
  }, 60 * 1000); // 60 seconds
};

module.exports = {
  monitorBuildStatus,
};
