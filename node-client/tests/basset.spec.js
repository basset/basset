const Basset = require('../lib/basset');

jest.mock('fs', () => ({
  createReadStream: jest.fn(() => 'file'),
}));

jest.mock('../lib/client', () => ({
  Client: jest.fn(() => ({
    buildStart: jest.fn(() => Promise.resolve({ id: 'tester', assets: [] })),
    buildFinish: jest.fn(() => Promise.resolve({ submitted: true })),
    uploadAsset: jest.fn(() => Promise.resolve({})),
    uploadSnapshot: jest.fn(() => Promise.resolve({})),
  })),
}));
jest.mock('../lib/git', () => ({
  getGitInfo: jest.fn(),
}));
jest.mock('../lib/assets', () => ({
  getAssets: jest.fn(() => Promise.resolve({})),
}));
jest.mock('../lib/generate-hash', () => ({
  generateHash: jest.fn(() => 'sha'),
  generateFileHash: jest.fn(() => 'fileSha'),
}));
const fs = require('fs');

const client = require('../lib/client');
const git = require('../lib/git');
const assets = require('../lib/assets');

const makeBasset = () =>
  new Basset('token', 'staticDir', 'bassetUrl', 'baseUrl');

beforeEach(() => {
  jest.clearAllMocks();
});

test('constructor', () => {
  const basset = makeBasset();
  expect(basset.token).toBe('token');
  expect(basset.staticDir).toBe('staticDir');
  expect(basset.baseUrl).toBe('baseUrl');
  expect(basset.client).toBeDefined();
});

test('startBuild', async () => {
  const basset = makeBasset();

  jest.spyOn(basset, 'getAssets');
  jest.spyOn(basset, 'uploadAssets');
  basset.client.buildId = '1';
  await basset.buildStart();
  expect(basset.getAssets).toHaveBeenCalledTimes(1);
  expect(basset.uploadAssets).toHaveBeenCalledTimes(1);
  expect(basset.client.buildStart).toHaveBeenCalledTimes(1);
});

test('buildFinish', async () => {
  const basset = makeBasset();
  basset.client.buildId = '1';
  await basset.buildFinish();
  expect(basset.client.buildFinish).toHaveBeenCalledTimes(1);
});

test('buildFinish no build', async () => {
  const basset = makeBasset();
  basset.client.buildId = null;
  try {
    await basset.buildFinish();
  } catch (error) {
    expect(error.message).toBe('There is no build to finish');
  }
});

test('getAssets', async () => {
  const basset = makeBasset();
  await basset.getAssets();
  expect(assets.getAssets).toHaveBeenCalledWith(
    basset.staticDir,
    basset.baseUrl,
  );
});

test('uploadAssets', async () => {
  const basset = makeBasset();
  basset.client.buildId = '1';
  await basset.uploadAssets({});
  expect(basset.client.uploadAsset).not.toHaveBeenCalled();
  await basset.uploadAssets({
    '/path/tofile1': '1',
    '/path/tofile2': '2',
    '/path/tofile3': '3',
  });
  expect(fs.createReadStream).toHaveBeenCalledWith(
    `${basset.staticDir}/path/tofile1`,
  );
  expect(basset.client.uploadAsset).toHaveBeenCalledWith(
    `${basset.baseUrl}/path/tofile1`,
    '1',
    'file',
  );
});

test('uploadAssets with no buildId', async () => {
  const basset = makeBasset();
  basset.client.buildId = null;
  try {
    await basset.uploadAssets();
  } catch (error) {
    expect(error.message).toBe(
      'You cannot upload assets without starting a build',
    );
  }
});

test('uploadSnapshotSource', async () => {
  const basset = makeBasset();
  basset.client.buildId = '1';
  await basset.uploadSnapshotSource({ title: 'ha' }, '<html></html>');
  expect(fs.createReadStream).not.toHaveBeenCalled();
  expect(basset.client.uploadSnapshot).toHaveBeenCalledWith(
    { title: 'ha' },
    'ha.html',
    'sha',
    '<html></html>',
  );
});

test('uploadSnapshotSource with no buildId', async () => {
  const basset = makeBasset();
  basset.client.buildId = null;
  try {
    await basset.uploadSnapshotSource();
  } catch (error) {
    expect(error.message).toBe(
      'You cannot upload snapshots without starting a build',
    );
  }
});

test('uploadSnapshotFile', async () => {
  const basset = makeBasset();
  basset.client.buildId = '1';
  await basset.uploadSnapshotFile({ title: 'ha' }, '/path/tofile1');
  expect(fs.createReadStream).toHaveBeenCalledWith(`/path/tofile1`);
  expect(basset.client.uploadSnapshot).toHaveBeenCalledWith(
    { title: 'ha' },
    'ha.html',
    'fileSha',
    'file',
  );
});

test('uploadSnapshotFile with no buildId', async () => {
  const basset = makeBasset();
  basset.client.buildId = null;
  try {
    await basset.uploadSnapshotSource();
  } catch (error) {
    expect(error.message).toBe(
      'You cannot upload snapshots without starting a build',
    );
  }
});
