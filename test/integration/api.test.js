const request = require('supertest');
const app = require('../../index.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');


jest.setTimeout(30000); // 30 seconds

describe('URL Shortener API', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        // Faster startup with these options
        dbName: 'testDB',
        port: 27017, // Fixed port helps with CI environments
      },
      binary: {
        version: '6.0.3', // Specify a MongoDB version
      }
    });
    
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      serverSelectionTimeoutMS: 10000, // 10 seconds server selection timeout
    });
  });

  afterAll(async () => {
    // Cleanup in proper order
    try {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  });

  beforeEach(async () => {
    // Clear database before each test
    await mongoose.connection.db.dropDatabase();
  });

  describe('POST /api/encode', () => {
    test('should encode a URL and return a short URL', async () => {
      const response = await request(app)
        .post('/api/encode')
        .send({ longUrl: 'https://www.namecheap.com/hosting/shared/' })
        .expect(200);

      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortUrl).toMatch(/^http:\/\/localhost:5000\/\w+$/);
    });

    test('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/encode')
        .send({ longUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return the same short URL for duplicate long URL', async () => {
      const longUrl = 'https://example.com/duplicate-test';
      
      const firstResponse = await request(app)
        .post('/api/encode')
        .send({ longUrl });
      
      const secondResponse = await request(app)
        .post('/api/encode')
        .send({ longUrl })
        .expect(200);

      expect(firstResponse.body.shortUrl).toBe(secondResponse.body.shortUrl);
    });
  });

  describe('POST /api/decode', () => {
    test('should decode a short URL and return the original URL', async () => {
      // First encode a URL
      const encodeResponse = await request(app)
        .post('/api/encode')
        .send({ longUrl: 'https://example.com/to-decode' });

      // Then decode it
      const decodeResponse = await request(app)
        .post('/api/decode')
        .send({ shortUrl: encodeResponse.body.shortUrl })
        .expect(200);

      expect(decodeResponse.body).toHaveProperty('longUrl');
      expect(decodeResponse.body.longUrl).toBe('https://example.com/to-decode');
    });

    test('should return 404 for non-existent short URL', async () => {
      const response = await request(app)
        .post('/api/decode')
        .send({ shortUrl: 'http://localhost:5000/nonexistent' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for invalid short URL', async () => {
      const response = await request(app)
        .post('/api/decode')
        .send({ shortUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Integration between encode and decode', () => {
    test('should correctly encode then decode a URL', async () => {
      const longUrl = 'https://example.com/integration-test';
      
      // Encode
      const encodeResponse = await request(app)
        .post('/api/encode')
        .send({ longUrl });

      // Decode
      const decodeResponse = await request(app)
        .post('/api/decode')
        .send({ shortUrl: encodeResponse.body.shortUrl });

      // Verify
      expect(decodeResponse.body.longUrl).toBe(longUrl);
    });

    test('should maintain data consistency', async () => {
      // Encode multiple URLs
      const urlsToTest = [
        'https://example.com/first',
        'https://example.com/second',
        'https://example.com/third'
      ];

      const encodePromises = urlsToTest.map(url => 
        request(app).post('/api/encode').send({ longUrl: url })
      );

      const encodeResponses = await Promise.all(encodePromises);

      // Decode all
      const decodePromises = encodeResponses.map(res => 
        request(app).post('/api/decode').send({ shortUrl: res.body.shortUrl })
      );

      const decodeResponses = await Promise.all(decodePromises);

      // Verify all original URLs match
      decodeResponses.forEach((res, index) => {
        expect(res.body.longUrl).toBe(urlsToTest[index]);
      });
    });
  });
});