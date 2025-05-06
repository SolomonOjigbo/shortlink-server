// jest.setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  if (process.env.USE_LOCAL_MONGO === 'true') {
    process.env.MONGO_URL = 'mongodb://localhost:27017/shortlink-test';
  } else {
    const instance = await MongoMemoryServer.create({
      instance: {
        dbName: 'jest-test-db',
        port: 27018,
      },
      binary: {
        version: '6.0.3',
        skipMD5: true
      }
    });
    process.env.MONGO_URL = instance.getUri();
    global.__MONGOD__ = instance;
  }
  
  // Test connection
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URL);
  await mongoose.disconnect();
};