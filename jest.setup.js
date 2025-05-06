const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  // Global setup for all test suites
  const instance = await MongoMemoryServer.create({
    instance: {
      dbName: 'jest-test-db',
      port: 27017,
    },
    binary: {
      version: '6.0.3',
    }
  });
  
  process.env.MONGO_URI = instance.getUri();
  
  global.__MONGOD__ = instance;
};