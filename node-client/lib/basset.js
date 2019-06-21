const fs = require('fs');
const path = require('path');

const { Client } = require('./client');
const { getGitInfo } = require('./git');
const { generateFileHash, generateHash } = require('./generate-hash');
const { getAssets } = require('./assets');

class Basset {
  constructor(token, staticDir, bassetUrl, baseUrl = '') {
    this.token = token;
    this.staticDir = staticDir;
    this.baseUrl = baseUrl;
    this.client = new Client(bassetUrl, token);
  }

  async buildStart() {
    const currentAssets = await this.getAssets();
    const gitInfo = await getGitInfo();

    const { assets } = await this.client.buildStart({
      ...gitInfo,
      assets: currentAssets,
    });
    await this.uploadAssets(assets);
  }

  async buildFinish() {
    if (!this.client.buildId) {
      throw new Error('There is no build to finish');
    }
    return this.client.buildFinish();
  }

  getAssets() {
    return getAssets(this.staticDir, this.baseUrl);
  }

  async uploadAssets(assets) {
    if (!this.client.buildId) {
      throw new Error('You cannot upload assets without starting a build');
    }
    for await (const [filePath, sha] of Object.entries(assets)) {
      const relativePath = path.join(this.baseUrl, filePath);
      const fileStream = fs.createReadStream(
        path.join(this.staticDir, filePath),
      );

      await this.client.uploadAsset(relativePath, sha, fileStream);
    }
  }

  async uploadSnapshotSource(snapshot, source) {
    if (!this.client.buildId) {
      throw new Error('You cannot upload snapshots without starting a build');
    }
    const sha = generateHash(source);
    const relativePath = `${snapshot.title}.html`; // snapshots are treated as they are in the root path
    await this.client.uploadSnapshot(snapshot, relativePath, sha, source);
  }

  async uploadSnapshotFile(snapshot, filePath) {
    if (!this.client.buildId) {
      throw new Error('You cannot upload snapshots without starting a build');
    }
    const sha = await generateFileHash(filePath);
    const relativePath = `${snapshot.title}.html`; // snapshots are treated as they are in the root path
    const file = fs.createReadStream(filePath);
    await this.client.uploadSnapshot(snapshot, relativePath, sha, file);
  }
}

module.exports = Basset;
