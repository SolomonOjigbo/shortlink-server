const mockUrl = {
    _id: '507f1f77bcf86cd799439011',
    longUrl: 'https://www.namecheap.com/hosting/shared/',
    shortUrl: 'http://localhost:5000/mock123',
    urlPath: 'mock123',
    clicks: 0,
    createdAt: new Date(),
    lastAccessed: null
  };
  
  const Url = {
    findOne: jest.fn().mockImplementation((query) => {
      if (query.urlPath === 'nonexistent') return null;
      return Promise.resolve(mockUrl);
    }),
    create: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
    find: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([mockUrl])
      }))
    })),
    deleteMany: jest.fn().mockResolvedValue({}),
    findOneAndUpdate: jest.fn().mockImplementation((query, update) => {
      return Promise.resolve({
        ...mockUrl,
        ...update.$set,
        clicks: mockUrl.clicks + 1
      });
    })
  };
  
  module.exports = Url;