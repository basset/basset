const assets = require('../lib/assets');

let mockReaddir = [
  { name: '1.png', isDirectory: () => false },
  { name: '2.png', isDirectory: () => false },
  { name: '3.png', isDirectory: () => false },
  { name: '4.png', isDirectory: () => false },
];
jest.mock('fs', () => ({
  readdir: (d, opt, cb) => {
    if (d.includes('dir')) {
      return cb(null, [{ name: 'test.png', isDirectory: () => false }]);
    }
    return cb(null, mockReaddir);
  },
}));

jest.mock('../lib/generate-hash', () => ({
  generateHash: jest.fn(() => 'sha'),
  generateFileHash: jest.fn(() => `fileSha`),
}));

test('walk returns a list of assets', async () => {
  const data = await assets.walk('/', 'baseUrl');
  expect(data).toEqual(
    expect.objectContaining({
      'baseUrl/1.png': 'fileSha',
      'baseUrl/2.png': 'fileSha',
      'baseUrl/3.png': 'fileSha',
      'baseUrl/4.png': 'fileSha',
    }),
  );
});

test('walk recurisvely searches directories', async () => {
  mockReaddir = [{ name: 'dir', isDirectory: () => true }];
  const data = await assets.walk('/', 'baseUrl');
  expect(data).toEqual(
    expect.objectContaining({
      'baseUrl/dir/test.png': 'fileSha',
    }),
  );
});
