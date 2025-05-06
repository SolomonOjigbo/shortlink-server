// test/testHelpers.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../index');

module.exports.setupTestServer = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  const server = http.createServer(app);
  
  return {
    server,
    mongoServer,
    close: async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  };
};