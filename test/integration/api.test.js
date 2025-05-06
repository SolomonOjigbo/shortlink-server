const request = require('supertest');
const app = require('../../index.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');


// Set longer timeout for all tests
jest.setTimeout(30000);

describe('URL Shortener API', () => {
  let mongoServer;
  let server;
  let originalMongoUri; 

  beforeAll(async () => {

    originalMongoUri = process.env.MONGO_URL;
    
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'testDB',
        port: 0, // Random available port
      },
      binary: {
        version: '6.0.3',
      }
    });
    
  
    // Create HTTP server
    server = http.createServer(app);
    server.listen(0); 
   
  });

  afterAll(async () => {
    // Cleanup in proper order
    await mongoose.disconnect();
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    // Restore original MONGO_URI if it existed
    if (originalMongoUri) {
      process.env.MONGO_URL = originalMongoUri;
    } else {
      delete process.env.MONGO_URL;
    }
  });

  beforeEach(async () => {
    // Clear database before each test
    await mongoose.connection.db.dropDatabase();
  });

  // Helper function for connection with retries
  // const connectWithRetry = async (uri) => {
  //   try {
  //     await mongoose.connect(uri, {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //       connectTimeoutMS: 10000,
  //       serverSelectionTimeoutMS: 10000,
  //     });
  //     console.log('Connected to MongoDB for testing');
  //   } catch (err) {
  //     console.error('Failed to connect to MongoDB - retrying in 5 sec', err);
  //     await new Promise(resolve => setTimeout(resolve, 5000));
  //     await connectWithRetry(uri);
  //   }
  // };

  describe('POST /api/encode', () => {
    test('should encode a URL and return a short URL', async () => {
      const response = await request(server)
        .post('/api/encode')
        .send({ longUrl: 'https://example.com/encoded-url-test' })
        .expect(201);
      
      expect(response.body).toHaveProperty('shortUrl');
      // Updated regex to match both localhost and 127.0.0.1
      expect(response.body.shortUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/\w+$/);
    });

    test('should return 400 for invalid URL', async () => {
      const response = await request(server)
        .post('/api/encode')
        .send({ longUrl: 'not-a-valid-url' })
        .expect(400);
      
      // Updated to check for errors array
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('msg', 'Must be a valid URL');
    });

    test('should return the same short URL for duplicate long URL', async () => {
      const longUrl = 'https://example.com/duplicate-test';
      
      const firstResponse = await request(server)
        .post('/api/encode')
        .send({ longUrl })
        .expect(201);
      
      const secondResponse = await request(server)
        .post('/api/encode')
        .send({ longUrl })
        .expect(200); // Changed to 200 for existing resource

      expect(firstResponse.body.shortUrl).toBe(secondResponse.body.shortUrl);
    });
  });

  describe('POST /api/decode', () => {
    test('should decode a short URL and return the original URL', async () => {
      const encodeResponse = await request(server)
        .post('/api/encode')
        .send({ longUrl: 'https://example.com/to-decode' })
        .expect(201);

      const decodeResponse = await request(server)
        .post('/api/decode')
        .send({ shortUrl: encodeResponse.body.shortUrl })
        .expect(200);

      expect(decodeResponse.body).toHaveProperty('longUrl');
      expect(decodeResponse.body.longUrl).toBe('https://example.com/to-decode');
    });

    test('should return 404 for non-existent short URL', async () => {
      // First create a test URL to ensure the path is valid
      const encodeResponse = await request(server)
        .post('/api/encode')
        .send({ longUrl: 'https://example.com/exists' })
        .expect(201);
      
      // Extract the base URL pattern
      const baseUrl = encodeResponse.body.shortUrl.split('/').slice(0, 3).join('/');
      
      // Test with a non-existent path
      await request(server)
        .post('/api/decode')
        .send({ shortUrl: `${baseUrl}/nonexistent` })
        .expect(404);
    });

    test('should return 400 for invalid short URL', async () => {
      const response = await request(server)
        .post('/api/decode')
        .send({ shortUrl: 'not-a-valid-url' })
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('msg', 'Must be a valid URL');
    });
  });

  describe('Integration between encode and decode', () => {
    test('should correctly encode then decode a URL', async () => {
      const longUrl = 'https://example.com/integration-test';
      
      const encodeResponse = await request(server)
        .post('/api/encode')
        .send({ longUrl })
        .expect(201);

      const decodeResponse = await request(server)
        .post('/api/decode')
        .send({ shortUrl: encodeResponse.body.shortUrl })
        .expect(200);

      expect(decodeResponse.body.longUrl).toBe(longUrl);
    });

    test('should maintain data consistency', async () => {
      const urlsToTest = [
        'https://example.com/first',
        'https://example.com/second',
        'https://example.com/third'
      ];

      const encodePromises = urlsToTest.map(url => 
        request(server).post('/api/encode').send({ longUrl: url }).expect(201)
      );

      const encodeResponses = await Promise.all(encodePromises);

      const decodePromises = encodeResponses.map(res => 
        request(server).post('/api/decode').send({ shortUrl: res.body.shortUrl }).expect(200)
      );

      const decodeResponses = await Promise.all(decodePromises);

      decodeResponses.forEach((res, index) => {
        expect(res.body.longUrl).toBe(urlsToTest[index]);
      });
    });
  });
});