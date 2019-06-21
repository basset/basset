const Build = require('../models/Build');

const buildTimeout = 10 * 60 * 1000; // 10 minutes

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
    await monitorBuildStatus(buildId);
    console.log('ran it baby', buildId)
  }, 60 * 1000); // 60 seconds
};

module.exports = {
  monitorBuildStatus,
};
