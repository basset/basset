const Readable = require('stream').Readable;
const transform = require('../../../app/utils/stream-transformer');
const { getAssetsPath } = require('../../../app/utils/build');
const { createBuildAsset } = require('../../utils/asset');
const { createProject } = require('../../utils/project');
const { createBuild } = require('../../utils/build');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('stream transformer', () => {
  let organization, project, assets, build, baseUrl, assetPath;
  beforeAll(async () => {
    organization = await createOrganization('awesometest');
    project = await createProject('yay', organization.id);
    build = await createBuild('master', project);
    const buildAssets = [
      await createBuildAsset('path/to/file.js', 'http://basset.io/baseUrl/assets/file.js', build, project),
      await createBuildAsset('different/path/to/file.css', 'http://basset.io/baseUrl/assets/file.css', build, project),
      await createBuildAsset('another/path/to/file.png', 'http://basset.io/baseUrl/assets/file.png', build, project),
    ];
    assets = buildAssets.map(buildAsset => ({
      relativePath: buildAsset.relativePath,
      sha: buildAsset.asset.sha,
    }));
    baseUrl = 'http://basset.io/baseUrl/assets';
    assetPath = assets.map(asset => getAssetsPath(asset.relativePath,asset.sha));
  });

  test('replaceUrl', async () => {
    let str = 'background-image: url(different/path/to/file.css)';
    jest.spyOn(str.__proto__, 'replace');

    let newStr = transform.replaceUrl(assets, str, baseUrl, '');
    expect(newStr).toBe(
      `background-image: url(${baseUrl}/${assetPath[1]})`,
    );
    expect(str.replace).toHaveBeenCalled();
  });

  test('findAsset', () => {
    const found = transform.findAsset(assets, 'another/path/to/file.png');
    expect(found).toBe(assets[2]);
    const foundAgain = transform.findAsset(assets, '/another/path/to/file.png');
    expect(foundAgain).toBe(assets[2]);
    const notFound = transform.findAsset(assets, 'not/found');
    expect(notFound).toBeUndefined();
  });
  describe('transformHTML', () => {
    it('should replace src and href attributes for style, link and img tags', async () => {
      const stream = new Readable();
      stream.push(
        `<html><head><link rel="stylesheet" href="/different/path/to/file.css"><script src="path/to/file.js"></script></head><body><img src="another/path/to/file.png"></body></html>`,
      );
      stream.push(null);
      const returnedStream = transform.transformHTML(assets, baseUrl, '');
      stream.pipe(returnedStream);
      const data = await readStream(returnedStream);

      expect(data).toBe(
        `<html><head><link rel="stylesheet" href="${baseUrl}/${assetPath[1]}"><script src="${baseUrl}/${assetPath[0]}"></script></head><body><img src="${baseUrl}/${assetPath[2]}"></body></html>`,
      );
    });
    it('should not replace urls that start with http or https', async () => {
      const stream = new Readable();
      stream.push(
        `<html><head><link rel="stylesheet" href="http://basset.io/asset/different/path/to/file.css"></head><body><img src="another/path/to/file.png"></body></html>`,
      );
      stream.push(null);
      const returnedStream = transform.transformHTML(assets, baseUrl, '');
      stream.pipe(returnedStream);
      const data = await readStream(returnedStream);
      expect(data).toBe(
        `<html><head><link rel="stylesheet" href="http://basset.io/asset/different/path/to/file.css"></head><body><img src="${baseUrl}/${assetPath[2]}"></body></html>`,
      );
    });
    it('should not replace urls that it does not have an asset for', async () => {
      const stream = new Readable();
      stream.push(
        `<html><head><link rel="stylesheet" href="some/different/path/to/file.css"></head><body><img src="another/path/to/file.png"></body></html>`,
      );
      stream.push(null);

      const returnedStream = transform.transformHTML(assets, baseUrl, '');
      stream.pipe(returnedStream);
      const data = await readStream(returnedStream);
      expect(data).toBe(
        `<html><head><link rel="stylesheet" href="some/different/path/to/file.css"></head><body><img src="${baseUrl}/${assetPath[2]}"></body></html>`,
      );
    });
    it('should replace urls in style tags', async () => {
      const stream = new Readable();
      stream.push(
        `<html><head><style>body { background-image: url("path/to/file.js"); } div { background-image: url(different/path/to/file.css); }</style></head><body><div>Test</div></body></html>`,
      );
      stream.push(null);

      const returnedStream = transform.transformHTML(assets, baseUrl, '');
      stream.pipe(returnedStream);
      const data = await readStream(returnedStream);
      expect(data).toBe(
        `<html><head><style>body { background-image: url(${baseUrl}/${assetPath[0]}); } div { background-image: url(${baseUrl}/${assetPath[1]}); }</style></head><body><div>Test</div></body></html>`,
      );
    });
  });

  test('transformCSS', async () => {
    const stream = new Readable();
    stream.push(
      `body { background-image: url("path/to/file.js"); } div { background-image: url(different/path/to/file.css); } p { background-image: url(http://basset.io/assets/image.img); }`,
    );
    stream.push(null);
    const returnedStream = transform.transformCSS(assets, baseUrl);
    stream.pipe(returnedStream);
    const data = await readStream(returnedStream);
    expect(data).toBe(
      `body { background-image: url(${baseUrl}/${assetPath[0]}); } div { background-image: url(${baseUrl}/${assetPath[1]}); } p { background-image: url(http://basset.io/assets/image.img); }`,
    );
  });
  test('transformCSS uses a currentPath to check for nested assets', async () => {
    const otherBuildAssets = [
      await createBuildAsset('path/to/dir/with/file.js', 'http://basset.io/baseUrl/assets/file.js', build, project),
      await createBuildAsset('path/to/dir/with/file.css', 'http://basset.io/baseUrl/assets/file.css', build, project),
    ];
    otherAssets = otherBuildAssets.map(buildAsset => ({
      relativePath: buildAsset.relativePath,
      sha: buildAsset.asset.sha,
    }));
    otherAssetPath = otherAssets.map(asset => getAssetsPath(asset.relativePath,asset.sha));
    const stream = new Readable();
    stream.push(
      `body { background-image: url("file.js"); } div { background-image: url(file.css); } p { background-image: url(http://basset.io/assets/image.img); }`,
    );
    stream.push(null);
    const returnedStream = transform.transformCSS(otherAssets, baseUrl, 'path/to/dir/with');
    stream.pipe(returnedStream);
    const data = await readStream(returnedStream);
    expect(data).toBe(
      `body { background-image: url(${baseUrl}/${otherAssetPath[0]}); } div { background-image: url(${baseUrl}/${otherAssetPath[1]}); } p { background-image: url(http://basset.io/assets/image.img); }`,
    );
  })
});

const readStream = stream => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};
