const db = require('../../db');
const deleteAssets = require('./deleteAssets');
const checkBuilds = require('./checkBuilds');

db.configure();

const DAILY = "daily";
const EVERY_FIVE_MINUTES = 'every-5-minutes';

const cronTasks = {
 [DAILY]: [
    deleteAssets,
  ],
  [EVERY_FIVE_MINUTES]: [
    checkBuilds,
  ]
};

const runTasks = (tasks) => Promise.all(tasks.map(task => task.call()));

async function handleTask() {
  const schedule = process.argv.slice(2);
  const tasks = cronTasks[schedule];
  if (tasks) {
    await runTasks(tasks);
  }
  await destroy();
}

handleTask();

const destroy = async () => {
  await knex.destroy();
};
