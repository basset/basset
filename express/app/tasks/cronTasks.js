const Build = require('../models/Build');

const { checkBuild } = require('./builds');

const cronTasks = async () => {
  const builds = await Build
    .query()
    .whereNull('completedAt')
    .orWhereNot('error', true);

  for await (const build of builds) {
    await checkBuild(build);
  }
};

cronTasks();
