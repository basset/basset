const mocks3factory = jest.fn(opts => {
  return mocks3Fn;
});

const mocks3Fn = jest.fn(() => ({
  createBucket: jest.fn(({ Bucket }) => {
    if (Bucket === 'BUCKET_ERROR') {
      throw { statusCode: 500 };
    }
    return {
      promise: jest.fn(() => Promise.resolve),
    };
  }),
  headBucket: jest.fn(({ Bucket }) => {
    if (Bucket === 'BUCKET_ERROR') {
      throw { statusCode: 500 };
    }
    if (Bucket === 'BUCKET_404') {
      throw { statusCode: 404 };
    }
    return {
      promise: jest.fn(() => Promise.resolve),
    };
  }),
}))();

jest.mock('aws-sdk', () => {
  return {
    S3: mocks3factory,
  };
});

jest.mock('../../../app/utils/stream-transformer', () => ({
  transformHTML: jest.fn(),
  transformCSS: jest.fn(),
}));

require('aws-sdk');

const transformer = require('.../../../app/utils/stream-transformer');
const upload = require('../../../app/utils/upload');

describe('upload utils', () => {
  test('checkBucket', async () => {
    mocks3Fn.headBucket.mockClear();
    const result = await upload.checkBucket('BUCKET');
    expect(result).toBe(true);
    expect(mocks3Fn.headBucket).toHaveBeenCalledTimes(1);
    expect(mocks3Fn.createBucket).not.toHaveBeenCalled();
    try {
      await upload.checkBucket('BUCKET_ERROR');
    } catch (error) {
      expect(mocks3Fn.createBucket).not.toHaveBeenCalled();
    }
    await upload.checkBucket('BUCKET_404');
    expect(mocks3Fn.createBucket).toHaveBeenCalledTimes(1);
  });
  test('createBucket', async () => {
    mocks3Fn.createBucket.mockClear();
    await upload.createBucket('BUCKET');
    expect(mocks3Fn.createBucket).toHaveBeenCalledTimes(1);
    try {
      await upload.createBucket('BUCKET_ERROR');
    } catch (error) {
      expect(mocks3Fn.createBucket).toHaveBeenCalledTimes(2);
    }
  });

  test('getSnapshotContentType', () => {
    const cb = jest.fn();
    const file = {
      stream: {
        pipe: jest.fn(() => ({})),
      },
    };
    const req = {
      locals: {
        assets: [],
        build: {
          projectId: 1,
          organizationId: 2,
        },
      },
      headers: {
        'x-relative-path': '/',
      },
    };
    upload.getSnapshotContentType(req, file, cb);
    expect(transformer.transformHTML).toHaveBeenCalledWith(
      req.locals.assets,
      expect.stringContaining('/2/1/assets'),
      '',
    );
    expect(file.stream.pipe).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, 'text/html', {});
  });

  test('getSnapshotKey', () => {
    const cb = jest.fn();
    const req = {
      headers: {},
      locals: {
        build: {
          id: 1,
          projectId: 2,
          organizationId: 3,
        },
      },
    };
    upload.getSnapshotKey(req, {}, cb);
    expect(cb).toHaveBeenCalledWith(
      null,
      expect.stringContaining('3/2/1/'),
    );
  });

  test('getAssetContentType', () => {
    const cb = jest.fn();
    const file = {
      originalname: 'test.png',
      stream: {
        pipe: jest.fn(() => ({})),
      },
    };
    const req = {
      locals: {
        assets: [],
        build: {
          projectId: 1,
          organizationId: 2,
        },
      },
      headers: {
        'x-relative-path': '/path/to/stuff.png',
      },
    };
    upload.getAssetContentType(req, file, cb);
    expect(transformer.transformCSS).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, 'image/png');

    cb.mockClear();
    file.originalname = 'stuff.css';
    upload.getAssetContentType(req, file, cb);
    expect(transformer.transformCSS).toHaveBeenCalledWith(
      req.locals.assets,
      expect.stringContaining('/2/1/assets'),
      '/path/to',
    );
    expect(cb).toHaveBeenCalledWith(null, 'text/css', {});
  });

  test('getAssetKey', () => {
    const cb = jest.fn();
    const req = {
      headers: {
        'x-relative-path': 'path/to/file.json',
        'x-sha': '1234abcde',
      },
      locals: {
        build: {
          id: 1,
          projectId: 2,
          organizationId: 3,
        },
      },
    };
    upload.getAssetKey(req, {}, cb);
    expect(cb).toHaveBeenCalledWith(
      null,
      expect.stringContaining('3/2/assets'),
    );
    req.headers = {};
    upload.getAssetKey(req, {}, cb);
    expect(cb).toHaveBeenCalledWith('Invalid headers');
  });
});
