jest.mock('express', function() {
  this.routes = {};
  return {
    routes: this.routes,
    Router: () => ({
      post: (path, ...cb) => {
        this.routes[path] = cb;
      },
    }),
  };
});

jest.mock('../../../app/models/Build', () => {
  const Build = require.requireActual('../../../app/models/Build');
  Build.prototype.getPreviousBuild = jest.fn();
  Build.prototype.compareSnapshots = jest.fn();
  Build.prototype.started = jest.fn();
  return Build;
});

jest.mock('../../../app/models/Snapshot', () => {
  const Snapshot = require.requireActual('../../../app/models/Snapshot');
  Snapshot.prototype.compared = jest.fn();
  return Snapshot;
});
jest.mock('../../../app/models/Project', () => {
  const Project = require.requireActual('../../../app/models/Project');
  Project.prototype.getMissingAssets = jest.fn(() => [
    { 'path/to/file.png': 'sha1' },
  ]);
  Project.prototype.createAssets = jest.fn();
  return Project;
});
jest.mock('../../../app/utils/upload', () => {
  return {
    uploadAsset: {
      single: () => {
        return (req, res, next) => next(req, res);
      },
    },
    uploadSnapshot: {
      single: () => {
        return (req, res, next) => next(req, res);
      },
    },
    deleteFile: jest.fn(),
  };
});
let mockVerifyValue = true;
jest.mock('../../../app/utils/verify-hmac-signature', () => ({
  verifySignature: jest.fn((sign, body) => mockVerifyValue),
}));

const express = require('express');

require('../../../app/utils/verify-hmac-signature');
require('../../../app/utils/upload');
const Build = require('../../../app/models/Build');
const Project = require('../../../app/models/Project');
const Snapshot = require('../../../app/models/Snapshot');
require('../../../app/routes/build');
const { createAsset } = require('../../utils/asset');
const { createSnapshot } = require('../../utils/snapshot');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const { createOrganization } = require('../../utils/organization');

describe('build routes', () => {
  let project, build, organization, res;
  beforeAll(async () => {
    organization = await createOrganization('builder');
    project = await createProject('testr', organization.id);
    build = await createBuild('master', project);
    build.project = project;
  });

  beforeEach(() => {
    res = {
      json: jest.fn(data => data),
      status: jest.fn(function() {
        return this;
      }),
    };
  });
  describe('/start', async () => {
    it('should create a build', async () => {
      const req = {
        headers: {
          authorization: `Token ${project.key}`,
        },
        body: {
          ...build,
          commitMessage: 'test',
          commitSha: '12345abcdef',
          committerName: 'Tester lester',
          committerEmail: 'commit@basset.io',
          commitDate: new Date().toISOString(),
          authorName: 'Tester lester',
          authorEmail: 'commit@basset.io',
          authorDate: new Date().toISOString(),
        },
      };
      const result = await express.routes['/start'][0](req, res);
      expect(res.json).toHaveBeenCalledWith({
        id: result.id,
        assets: [],
      });
      expect(Build.prototype.getPreviousBuild).toHaveBeenCalled();
      expect(Build.prototype.started).toHaveBeenCalled();
      expect(Project.prototype.getMissingAssets).not.toHaveBeenCalled();
      expect(Project.prototype.createAssets).not.toHaveBeenCalled();
    });
    it('should return a 403 when the token is missing', async () => {
      const req = {
        headers: {
          authorization: '',
        },
      };
      await express.routes['/start'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
    it('should return missing assets', async () => {
      const req = {
        headers: {
          authorization: `Token ${project.key}`,
        },
        body: {
          ...build,
          commitMessage: 'test',
          commitSha: '12345abcdef',
          committerName: 'Tester lester',
          committerEmail: 'commit@basset.io',
          commitDate: new Date().toISOString(),
          authorName: 'Tester lester',
          authorEmail: 'commit@basset.io',
          authorDate: new Date().toISOString(),
          assets: [],
        },
      };
      const result = await express.routes['/start'][0](req, res);
      const assets = [
        {
          'path/to/file.png': 'sha1',
        },
      ];
      expect(Project.prototype.getMissingAssets).toHaveBeenCalled();
      expect(Project.prototype.createAssets).toHaveBeenCalledWith(assets);
      expect(res.json).toHaveBeenCalledWith({
        id: result.id,
        assets,
      });
    });
  });
  describe('/finish', () => {
    it('should finalize the build', async () => {
      const req = {
        headers: {
          authorization: `Token ${project.key}`,
        },
        body: {
          buildId: build.id,
        },
      };
      await express.routes['/finish'][0](req, res);
      expect(res.json).toHaveBeenCalledWith({ submitted: true });
      expect(Build.prototype.compareSnapshots).toHaveBeenCalled();
    });
    it('should return 403 when the auth header is invalid', async () => {
      const req = {
        headers: {
          authorization: 'borken 1234',
        },
        body: {
          buildId: build.id,
        },
      };
      await express.routes['/finish'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
    it('should return 403 when the token is invalid', async () => {
      const req = {
        headers: {
          authorization: `Token 1234`,
        },
        body: {
          buildId: build.id,
        },
      };
      await express.routes['/finish'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Build not found' });
    });
    it('should return 403 when the buildId is missing', async () => {
      const req = {
        headers: {
          authorization: `Token ${project.key}`,
        },
        body: {},
      };
      await express.routes['/finish'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Must supply buildId' });
    });
    it('should return 403 when the buildId is invalid', async () => {
      const req = {
        headers: {
          authorization: `Token ${project.key}`,
        },
        body: {
          buildId: project.id,
        },
      };
      await express.routes['/finish'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Build not found' });
    });
  });

  describe('/upload/asset', () => {
    it('should create a new asset', async () => {
      const req = {
        file: {
          location: 'some/weird/path',
        },
        headers: {
          'x-relative-path': 'path/to/test.json',
          'x-sha': 'sha1',
        },
        locals: {
          build,
        },
      };
      await express.routes['/upload/asset'][2](req, res);
      const assets = await project.$relatedQuery('assets');
      expect(assets).toHaveLength(1);
      expect(assets[0].location).toBe('some/weird/path');
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
    });
    it('should update an existing asset', async () => {
      let asset = await createAsset(project);
      const req = {
        file: {
          location: 'some/new/weird/path',
        },
        headers: {
          'x-relative-path': '/this/is/test.json',
          'x-sha': asset.sha,
        },
        locals: {
          build,
        },
      };
      await express.routes['/upload/asset'][2](req, res);
      asset = await asset.$query();
      expect(asset.location).toBe('some/new/weird/path');
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
    });

    test('403 errors', async () => {
      const req = {
        file: {
          location: 'some/new/weird/path',
        },
        headers: {
          'x-relative-path': 'some/odd/path',
          'x-sha': 'sha1',
        },
        locals: {
          build,
        },
      };
      req.headers['x-relative-path'] = null;
      await express.routes['/upload/asset'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid headers' });

      req.headers['x-sha'] = null;
      req.headers['x-relative-path'] = 'path';
      await express.routes['/upload/asset'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid headers' });

      req.locals.build = null;
      req.headers['x-sha'] = 'sha1';
      await express.routes['/upload/asset'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid build or missing file',
      });

      req.locals.build = build;
      req.file = null;
      await express.routes['/upload/asset'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid build or missing file',
      });
    });
  });

  describe('/upload/snapshot', () => {
    let req;
    beforeEach(async () => {
      jest.clearAllMocks();
      await build.$relatedQuery('snapshots').delete();
      req = {
        file: {
          location: 'snapshot/location',
        },
        headers: {
          'x-relative-path': 'snapshot/path',
          'x-sha': 'sha1',
        },
        body: {
          title: 'snapshot',
        },
        locals: {
          build,
        },
      };
    });
    it('should create a snapshot', async () => {
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
      const snapshots = await build.$relatedQuery('snapshots');
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].title).toBe('snapshot');
    });
    it('should set the browsers', async () => {
      req.body.browsers = 'firefox, chrome, ignore';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
      const snapshots = await build.$relatedQuery('snapshots');
      expect(snapshots).toHaveLength(2);
      expect(snapshots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ browser: 'firefox' }),
          expect.objectContaining({ browser: 'chrome' }),
        ]),
      );
    });
    it('should set the widths', async () => {
      req.body.widths = '720, 360';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
      const snapshots = await build.$relatedQuery('snapshots');
      expect(snapshots).toHaveLength(2);
      expect(snapshots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '360' }),
          expect.objectContaining({ width: '720' }),
        ]),
      );
    });
    it('should set the selectors', async () => {
      req.body.selectors = '.stuff, .tester';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
      const snapshots = await build.$relatedQuery('snapshots');
      expect(snapshots).toHaveLength(2);
      expect(snapshots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ selector: '.tester' }),
          expect.objectContaining({ selector: '.stuff' }),
        ]),
      );
    });
    it('should set the hide selectors', async () => {
      req.body.hideSelectors = '.hide-me, .or-me';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ uploaded: true });
      const snapshots = await build.$relatedQuery('snapshots');
      expect(snapshots).toHaveLength(1);
      expect(snapshots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ hideSelectors: '.hide-me, .or-me' }),
        ]),
      );
    });
    test('403 title', async () => {
      req.body.title = null;
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title must be included',
      });
    });
    test('403 x-sha missing', async () => {
      req.body.title = 'snapshot';
      delete req.headers['x-sha'];
      req.headers['x-relative-path'] = null;
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid headers' });
      expect(res.status).toHaveBeenCalledWith(403);
    });
    test('403 x-sha null', async () => {
      req.headers['x-sha'] = null;
      req.headers['x-relative-path'] = 'path';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid headers' });
      expect(res.status).toHaveBeenCalledWith(403);
    });
    test('403 build null', async () => {
      req.locals.build = null;
      req.headers['x-sha'] = 'sha1';
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid build' });
    });
    test('403 no file', async () => {
      req.locals.build = build;
      req.file = null;
      await express.routes['/upload/snapshot'][2](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'No file included' });
    });
  });

  describe('/compared', () => {
    let req, snapshot;
    beforeEach(async () => {
      snapshot = await createSnapshot('compared', build);
      req = {
        headers: {
          sign: '1234',
        },
        body: {
          id: snapshot.id,
          imageLocation: 'path/to/image.png',
          difference: 10,
          diffLocation: 'path/to/diff.png',
        },
      };
    });
    it('should update the snapshot', async () => {
      await express.routes['/compared'][0](req, res);
      expect(res.json).toHaveBeenCalledWith({ received: true });
      expect(Snapshot.prototype.compared).toHaveBeenCalled();
    });
    it('should return an error when signature is off', async () => {
      mockVerifyValue = false;
      await express.routes['/compared'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
    });
    it('should return an error when it cant find the snapshot id', async () => {
      mockVerifyValue = true;
      req.body.id = build.id;
      await express.routes['/compared'][0](req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Snapshot not found' });
    });
  });
});
