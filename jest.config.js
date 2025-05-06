module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./test/setupTests.js'],
    globalSetup: './jest.setup.js',
    globalTeardown: './jest.teardown.js',
    testTimeout: 30000,
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/config/',
      '/test/',
      '/jest.setup.js',
      '/jest.teardown.js'
    ],
    watchPathIgnorePatterns: [
      '/node_modules/',
      '/.git/'
    ]
  };