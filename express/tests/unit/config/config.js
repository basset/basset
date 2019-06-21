module.exports = {
  roots: ['<rootDir>/..'],
  testMatch: ['**/(*).test.js'],
  globalSetup: '<rootDir>/setup.js',
  globalTeardown: '<rootDir>/teardown.js',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
  testPathIgnorePatterns: ['/node_modules/', 'tests/selenium/*'],
};
