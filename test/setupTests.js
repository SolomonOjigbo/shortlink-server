
beforeEach(() => {
    // Reset all mocks between tests
    jest.clearAllMocks();
  });
  
  afterEach(async () => {
    // Clean up any test data
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });