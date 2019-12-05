const db = require('../db');
const deleteAssets = require('./deleteAssets');
const checkBuilds = require('./checkBuilds');

const knex = db.configure();

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
  console.log(`[cron] running ${tasks.length} tasks for ${schedule}`);
  if (tasks) {
    await runTasks(tasks);
  }
  console.log(`[cron] jobs done`);
  await destroy();
}

handleTask();

async function destroy() {
  await knex.destroy();
}
