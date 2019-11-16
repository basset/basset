const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const mkdirp = require('mkdirp');
const readline = require('readline');
const rimraf = util.promisify(require('rimraf'));

const Basset = require('@getbasset/node-client');

const BASSET_URL = 'http://app.basset.io';

const DIR = path.join(os.tmpdir(), 'jest_basset_global_setup');

class Snapshots {
  constructor() {
    mkdirp(DIR);
  }

  async cleanUp() {
    await rimraf(DIR);
    mkdirp(DIR);
  }

  static async snapshot({
    source,
    title,
    selectors,
    widths,
    browsers,
    hideSelectors,
  }) {
    await fs.promises.writeFile(path.join(DIR, `${title}.html`), source);
    await fs.promises.appendFile(
      path.join(DIR, 'snapshots.json'),
      `${JSON.stringify({
        title,
        selectors,
        widths,
        browsers,
        hideSelectors,
      })}\n`,
    );
  }

  async getSnapshots() {
    const file = path.join(DIR, 'snapshots.json');
    try {
      await fs.promises.access(file, fs.constants.R_OK);
    } catch (error) {
      console.error(error);
      return [];
    }
    return new Promise((resolve, reject) => {
      const snapshots = [];
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
      });
      rl.on('line', line => {
        snapshots.push(JSON.parse(line));
      });
      rl.on('close', () => {
        resolve(snapshots);
      });
    });
  }

  async submit() {
    const basset = new Basset(process.env.BASSET_TOKEN, 'static', BASSET_URL, {
      ignoreExtensions: '.js,.map',
    });
    console.log(basset);
    const snapshots = await this.getSnapshots();
    console.log('Submitting build');
    await basset.buildStart();
    for await (const snapshot of snapshots) {
      console.log('sending snapshot ', snapshot.title);
      const filePath = path.join(DIR, `${snapshot.title}.html`);
      await basset.uploadSnapshotFile(snapshot, filePath);
    }
    await basset.buildFinish();
    console.log('Build has been submitted');
  }
}

module.exports = Snapshots;
