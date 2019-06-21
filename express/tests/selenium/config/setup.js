if (!process.env.CI) {
  require('./test-settings');
}
const spawnd = require('spawnd');
const util = require('util');
const path = require('path');
const os = require('os');
const fs = require('fs');
const mkdirp = util.promisify(require('mkdirp'));
const rimraf = util.promisify(require('rimraf'));

const DIR = path.join(os.tmpdir(), 'jest_selenium_global_setup');

const { configure } = require('../../../app/db');
const Snapshots = require('./snapshots');

const configFile = path.join(DIR, 'config.json');
module.exports = async () => {
  const knex = configure();
  const setup = async () => {
    await rimraf(DIR);
    await mkdirp(DIR);
    const proc = spawnd('node tests/selenium/config/www.js', {
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        BASSET_CONFIG: configFile,
      },
    });
    proc.stdout.pipe(process.stdout);
    global.proc = proc;
    let count = 0;
    return new Promise((resolve, reject) => {
      const checkForFile = () => {
        fs.access(configFile, fs.F_OK, err => {
          if (err) {
            if (count === 20) {
              console.error('Server is not running.');
              reject();
              return;
            }
            count++;
            setTimeout(checkForFile, 500);
            return;
          }
          resolve();
        });
      };
      checkForFile();
    });
  };
  await knex.migrate.rollback();
  await knex.migrate.latest();

  global.knex = knex;
  global.snapshots = new Snapshots();
  await global.snapshots.cleanUp();
  await setup();
  console.log('Server is running');
};
