let mockRequest = () => [null, {}];

jest.mock('request', () => {
  return jest.fn((opt, cb) => {
    cb(...mockRequest(opt));
  });
});
const request = require('request');
const { Client } = require('../lib/client');
beforeEach(() => {
  jest.clearAllMocks();
});
test('request retries 500 errors', async () => {
  const client = new Client('', '');
  mockRequest = () => [
    null,
    {
      statusCode: 500,
      statusMessage: 'whoops',
    },
  ];
  try {
    const req = await client.request({});
  } catch (error) {
    expect(request).toHaveBeenCalledTimes(3);
    expect(error).toHaveLength(3);
    expect(error[0].message).toContain('whoops');
  }
});

test('does not retry on non 500 errors', async () => {
  const client = new Client('', '');
  mockRequest = () => [
    null,
    {
      statusCode: 400,
    },
  ];
  const req = await client.request({});
  expect(req).toEqual({
    statusCode: 400,
  });
});

test('buildStart fails', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      statusCode: 404,
      statusMessage: 'Not found',
    }),
  );
  try {
    const result = await client.buildStart({});
  } catch (error) {
    expect(error.message).toContain('404: Not found');
  }
});
test('buildStart succeeds', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      statusCode: 200,
      body: {
        id: 1,
        assets: [],
      },
    }),
  );

  const result = await client.buildStart({});
  expect(result).toEqual({
    id: 1,
    assets: [],
  });
  expect(client.buildId).toBe(1);
});

test('uploadSnapshot', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      body: '{"uploaded": false}',
    }),
  );
  try {
    await client.uploadSnapshot(
      { title: 'title' },
      'relativePath',
      'sha',
      'file',
    );
  } catch (error) {
    expect(error.message).toContain('problem uploading');
  }
  client.request = jest.fn(() =>
    Promise.resolve({
      body: '{"uploaded": true}',
    }),
  );
  const result = await client.uploadSnapshot(
    { title: 'title' },
    'relativePath',
    'sha',
    'file',
  );
});

test('uploadAsset', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      body: '{"uploaded": false}',
    }),
  );
  try {
    await client.uploadAsset('relativePath', 'sha', 'file');
  } catch (error) {
    expect(error.message).toContain('problem uploading');
  }
  client.request = jest.fn(() =>
    Promise.resolve({
      body: '{"uploaded": true}',
    }),
  );
  const result = await client.uploadAsset('relativePath', 'sha', 'file');
});

test('buildFinish fails', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      body: {
        submitted: false,
      },
    }),
  );
  try {
    const result = await client.buildFinish();
  } catch (error) {
    expect(error.message).toContain('issue finalizing this build.');
  }
});
test('buildStart succeeds', async () => {
  const client = new Client('bassetUrl', 'token');
  client.request = jest.fn(() =>
    Promise.resolve({
      body: {
        submitted: true,
      },
    }),
  );
  const result = await client.buildFinish();
});
