module.exports = {
  roots: ['<rootDir>/..'],
  testMatch: ['**/(*).test.js'],
  globalSetup: '<rootDir>/setup.js',
  testEnvironment: '<rootDir>/environment.js',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
  globalTeardown: '<rootDir>/teardown.js',
};
