const Build = require('../models/Build');
const { checkBuild } = require('./builds');

const run = async () => {
  console.log('[checkBuilds] checking for timed out builds');
  const builds = await Build
    .query()
    .whereNull('completedAt')
    .orWhereNot('error', true);

  for await (const build of builds) {
    await checkBuild(build);
  }
  console.log('[checkBuilds] complete');
};

module.exports = run;
