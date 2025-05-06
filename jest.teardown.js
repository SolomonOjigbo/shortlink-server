module.exports = async function globalTeardown() {
    // Cleanup mongoose connection
    if (global.__MONGOOSE__) {
      await global.__MONGOOSE__.disconnect();
    }
    
    // Stop MongoDB Memory Server
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
    }
  };