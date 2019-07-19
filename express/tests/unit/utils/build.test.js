const uuid = require('uuid/v4');
const utils = require('../../../app/utils/build');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const { createOrganization } = require('../../utils/organization');
const { createBuildAsset } = require('../../utils/asset');

describe('build utils', () => {
  let project, build, organization;
  beforeAll(async () => {
    organization = await createOrganization('builder');
    project = await createProject('testr', organization.id);
    build = await createBuild('master', project);
  });

  describe('checkBuild', async () => {
    let next, req, res;
    beforeEach(() => {
      next = jest.fn();
      req = {
        headers: {
          authorization: `Token ${project.key}`,
          'x-build-id': build.id,
        },
      };
      res = {
        status: jest.fn(function() {
          return this;
        }),
        json: jest.fn(),
      };
    });
    it('should error if build cannot be found', async () => {
      req.headers['x-build-id'] = null;
      await utils.checkBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid build' });
    });

    it('should error if token is not included', async () => {
      req.headers.authorization = null;
      await utils.checkBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      res.status.mockClear();
      res.json.mockClear();
      req.headers.authorization = 'Key 1234';
      await utils.checkBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should error if token is incorrect', async () => {
      req.headers.authorization = 'Token 1234';
      await utils.checkBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid build' });
    });
    it('should error if build id is incorrect', async () => {
      req.headers['x-build-id'] = uuid();
      await utils.checkBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid build' });
    });
    it('should set locals and call next', async () => {
      await utils.checkBuild(req, res, next);
      expect(req.locals.build).toEqual(expect.objectContaining(build));
      expect(req.locals.assets).toEqual([]);
      expect(next).toHaveBeenCalled();
    });
    it('should include assets with a null locations', async () => {
      const buildAssets = [
        await createBuildAsset('path/to/file.css', null, build, project),
        await createBuildAsset(
          'path/to/file.js',
          'site/path/to/file.js/sha1.js',
          build,
          project,
        ),
        await createBuildAsset(
          'path/to/file.png',
          'site/path/to/file.png/sha1.png',
          build,
          project,
        ),
      ];
      await utils.checkBuild(req, res, next);
      expect(req.locals.assets).toHaveLength(3);
      expect(req.locals.assets).toEqual([
        {
          relativePath: buildAssets[0].relativePath,
          sha: buildAssets[0].asset.sha,
        },
        {
          relativePath: buildAssets[1].relativePath,
          sha: buildAssets[1].asset.sha,
        },
        {
          relativePath: buildAssets[2].relativePath,
          sha: buildAssets[2].asset.sha,
        },
      ]);
    });
  });
  test('getToken', () => {
    const req = {
      headers: {
        authorization: 'Token 1234',
      },
    };
    expect(utils.getToken(req)).toBe('1234');
    req.headers.authorization = 'Key 1234';
    expect(utils.getToken(req)).toBe(null);
    req.headers = {};
    expect(utils.getToken(req)).toBe(null);
  });
  test('getBuildId', () => {
    const id = uuid();
    const req = {
      headers: {
        'x-build-id': id,
      },
    };
    expect(utils.getBuildId(req)).toBe(id);
    req.headers = {};
    expect(utils.getBuildId(req)).toBe(undefined);
  });
  test('getProject', async () => {
    const req = {
      headers: {
        authorization: `Token ${project.key}`,
      },
    };
    expect(await utils.getProject(req)).toEqual(project);
    req.headers.authorization = '';
    expect(await utils.getProject(req)).toBe(false);
    req.headers.authorization = `Token 1234`;
    expect(await utils.getProject(req)).toBe(false);
  });
  test('getAssetsPath', () => {
    const path = utils.getAssetsPath('path/to/test.json', '1234eacd');
    expect(path).toBe('1234eacd.json');
  });
});
