const db = require('../db');
const Build = require('../models/Build');
const { checkBuild } = require('./builds');

const knex = db.configure();

const cronTasks = async () => {
  console.log('[checkBuilds] checking for timed out builds');
  const builds = await Build
    .query()
    .whereNull('completedAt')
    .orWhereNot('error', true);

  for await (const build of builds) {
    await checkBuild(build);
  }
  console.log('[checkBuilds] complete');
  await destroy();
};

const destroy = async () => {
  await knex.destroy();
  process.exitCode = 1;
};

cronTasks();
