const express = require('express');

const Build = require('../models/Build');
const Project = require('../models/Project');
const Asset = require('../models/Asset');
const BuildAsset = require('../models/BuildAsset');
const Snapshot = require('../models/Snapshot');
const { uploadSnapshot, uploadAsset, deleteFile, uploadScreenshot } = require('../utils/upload');
const { verifySignature } = require('../utils/verify-hmac-signature');
const { checkBuild, getProject, getToken } = require('../utils/build');

const router = express.Router();

router.post('/start', async (req, res) => {
  const project = await getProject(req);
  if (!project) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  const data = {
    branch: req.body.branch,
    commitSha: req.body.commitSha,
    commitMessage: req.body.commitMessage,
    committerName: req.body.committerName,
    committerEmail: req.body.committerEmail,
    commitDate: req.body.commitDate,
    authorName: req.body.authorName,
    authorEmail: req.body.authorEmail,
    authorDate: req.body.authorDate,
    organizationId: project.organizationId,
    projectId: project.id,
  };

  let build = Build.fromJson(data);

  const compareBranch = req.body.compareBranch || null;
  const baseBuild = await build.getPreviousBuild({ project, compareBranch });
  const responseData = {};
  let missingAssets = [];

  if (baseBuild) {
    data.previousBuildId = baseBuild.id;
  }

  build = await Build.create(data);

  if (project.type === Project.TYPE.WEB) {
    if (req.body.assets) {
      missingAssets = await project.getMissingAssets(req.body.assets);
      await project.createAssets(missingAssets);
      await build.createAssets(project, req.body.assets);
    }
    responseData.assets = missingAssets;
  }

  await build.started();

  responseData.id = build.id;
  return res.json(responseData);
});

router.post('/finish', async (req, res) => {
  if (!req.body.buildId) {
    return res.status(403).json({ error: 'Must supply buildId' });
  }
  const token = getToken(req);
  if (!token) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  try {
    const build = await Build.query()
      .joinRelation('project')
      .where('project.key', token)
      .where('build.id', req.body.buildId)
      .first();

    if (!build) {
      return res.status(403).json({ error: 'Build not found' });
    }

    build.compareSnapshots();

    return res.json({ submitted: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
});

router.post(
  '/upload/asset',
  checkBuild,
  uploadAsset.single('asset'),
  async (req, res) => {
    const build = req.locals.build;
    if (!build || !req.file) {
      if (req.file) {
        deleteFile(req.file.bucket, req.file.key);
      }
      return res.status(403).json({ error: 'Invalid build or missing file' });
    }
    const relativePath = req.headers['x-relative-path'];
    const sha = req.headers['x-sha'];
    if (!relativePath || !sha) {
      return res.status(403).json({ error: 'Invalid headers' });
    }

    let asset = await Asset.query()
      .where('sha', sha)
      .first();
    if (asset) {
      await asset.$query().update({
        location: req.file.location,
      });
    } else {
      console.log(`could not find sha for ${relativePath}, creating new asset`);
      asset = await Asset.create({
        location: req.file.location,
        sha,
        projectId: build.projectId,
        organizationId: build.organizationId,
      });
    }
    const buildAsset = await BuildAsset.query()
      .where('relativePath', relativePath)
      .where('assetId', asset.id)
      .where('buildId', build.id);
    if (!buildAsset) {
      await BuildAsset.create({
        relativePath,
        assetId: asset.id,
        buildId: build.id,
        organizationId: build.organizationId,
      });
    }
    return res.json({ uploaded: true });
  },
);

const checkBody = (type) => (req, res, next) => {
  const title = req.body.title;
  const noTitle = !req.body.title || req.body.title.trim() === '';
  const sha = req.headers['x-sha'];
  const project = req.locals.build.project;
  const wrongType = project.type !== type;
  if (!req.file || noTitle || wrongType) {
    let error = 'Invalid build';
    if (wrongType) {
      error = `This endpoint is only for projects with type: ${type}`;
    } else if (noTitle) {
      error = 'Title must be included';
    }
    if (!req.file) {
      error = 'No file included';
    } else {
      deleteFile(req.file.bucket, req.file.key);
    }
    return res.status(403).json({ error });
  }
  if (!sha) {
    return res.status(403).json({ error: 'Invalid headers'});
  }
  console.log(title);
  next();
};

router.post(
  '/upload/snapshot',
  checkBuild,
  uploadSnapshot.single('snapshot'),
  checkBody(Project.TYPE.WEB),
  async (req, res) => {
    const project = req.locals.build.project;
    const build = req.locals.build;
    const title = req.body.title;
    const sha = req.headers['x-sha'];
    const relativePath = req.headers['x-relative-path'] || 'base';
    let browsers = project.browsers.split(',');
    if (req.body.browsers && req.body.browsers.trim() !== '') {
      browsers = req.body.browsers
        .replace(' ', '')
        .split(',')
        .filter(b => b.trim() !== '' && Project.allowedBrowsers.includes(b));
    }

    let widths = project.defaultWidth.split(',');
    if (req.body.widths && req.body.widths.trim() !== '') {
      widths = req.body.widths
        .replace(' ', '')
        .split(',')
        .filter(w => w.trim() !== '' && !isNaN(parseInt(w, 10)));
    }

    let hideSelectors = project.hideSelectors;
    if (req.body.hideSelectors && req.body.hideSelectors.trim() !== '') {
      hideSelectors = req.body.hideSelectors;
    }

    let selectors = [''];
    if (req.body.selectors && req.body.selectors.trim() !== '') {
      selectors = req.body.selectors.split(',').map(s => s.trim());
      if (selectors.length === 0) {
        selectors = [''];
      }
    }
    try {
      await Snapshot.createSnapshots({
        build,
        title,
        widths,
        browsers,
        relativePath,
        hideSelectors,
        selectors,
        sourceLocation: req.file.location,
        sha,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
    return res.json({ uploaded: true });
  },
);

router.post(
  '/upload/screenshot',
  checkBuild,
  uploadScreenshot.single('screenshot'),
  checkBody(Project.TYPE.IMAGE),
  async (req, res) => {
    const build = req.locals.build;
    const title = req.body.title;
    const sha = req.headers['x-sha'];

    try {
      await Snapshot.createSnapshots({
        build,
        title,
        widths: [''],
        browsers: [''],
        relativePath: '',
        hideSelectors: '',
        selectors: [''],
        imageLocation: req.file.location,
        sha,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
    return res.json({ uploaded: true });
  },
);

router.post('/compared', async (req, res) => {
  const signature = req.headers.sign;
  if (signature === undefined || !verifySignature(signature, req.body)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }
  try {
    const {
      id,
      imageLocation,
      difference,
      diffLocation,
      differenceAmount,
      diffSha,
      flakeMatched,
    } = req.body;
    const snapshot = await Snapshot.query()
      .eager('build')
      .findById(id);
    if (!snapshot) {
      return res.status(403).json({ error: 'Snapshot not found' });
    }
    await snapshot.compared(
      imageLocation,
      difference,
      diffLocation,
      differenceAmount,
      diffSha,
      flakeMatched,
    );

    return res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
