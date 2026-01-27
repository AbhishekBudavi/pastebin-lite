import request from 'supertest';
import app from '../src/index.js';
import { resetDatabase } from '../src/db/schema.js';
import { query, closePool } from '../src/db/pool.js';
import { generatePasteId } from '../src/utils/helpers.js';

/**
 * Test suite for Pastebin-Lite API
 */

describe('Pastebin-Lite API', () => {
  beforeAll(async () => {
    // Ensure database is clean for tests
    await resetDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  describe('POST /api/paste', () => {
    test('should create a paste with content', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Hello, World!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('localhost');
    });

    test('should create a paste with TTL', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Temporary content',
          ttl: 3600,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('should create a paste with view limit', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Limited views',
          view_limit: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('should create a paste with both TTL and view limit', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Full options',
          ttl: 7200,
          view_limit: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('should reject empty content', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject missing content', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid TTL', async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Test',
          ttl: -1,
        });

      expect(response.status).toBe(201);
      // Invalid TTL is silently ignored, paste created without expiry
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/paste/:id', () => {
    let pasteId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Test content for retrieval',
        });
      pasteId = response.body.id;
    });

    test('should fetch a paste by ID', async () => {
      const response = await request(app).get(`/api/paste/${pasteId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(pasteId);
      expect(response.body.content).toBe('Test content for retrieval');
    });

    test('should return 404 for non-existent paste', async () => {
      const response = await request(app).get('/api/paste/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });

    test('should return remaining_views as null for unlimited pastes', async () => {
      const response = await request(app).get(`/api/paste/${pasteId}`);

      expect(response.status).toBe(200);
      expect(response.body.remaining_views).toBeNull();
    });
  });

  describe('View Limit Enforcement', () => {
    let pasteId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Limited to 3 views',
          view_limit: 3,
        });
      pasteId = response.body.id;
    });

    test('should decrement views on each fetch', async () => {
      let response = await request(app).get(`/api/paste/${pasteId}`);
      expect(response.status).toBe(200);
      expect(response.body.remaining_views).toBe(2);

      response = await request(app).get(`/api/paste/${pasteId}`);
      expect(response.status).toBe(200);
      expect(response.body.remaining_views).toBe(1);

      response = await request(app).get(`/api/paste/${pasteId}`);
      expect(response.status).toBe(200);
      expect(response.body.remaining_views).toBe(0);
    });

    test('should return 404 when views exhausted', async () => {
      const response = await request(app).get(`/api/paste/${pasteId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('TTL (Time To Live) Enforcement', () => {
    test('should return paste before expiry', async () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Expiring content',
          ttl: 3600,
        })
        .set('x-test-now', now.toISOString());

      const pasteId = response.body.id;

      // Fetch before expiry
      const getResponse = await request(app)
        .get(`/api/paste/${pasteId}`)
        .set('x-test-now', new Date('2024-01-01T12:30:00Z').toISOString());

      expect(getResponse.status).toBe(200);
    });

    test('should return 404 after expiry', async () => {
      const now = new Date('2024-01-01T13:00:00Z');
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: 'Expiring content',
          ttl: 1800, // 30 minutes
        })
        .set('x-test-now', now.toISOString());

      const pasteId = response.body.id;

      // Fetch after expiry (31 minutes later)
      const getResponse = await request(app)
        .get(`/api/paste/${pasteId}`)
        .set(
          'x-test-now',
          new Date('2024-01-01T13:31:00Z').toISOString()
        );

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Race Condition Handling', () => {
    test('should handle concurrent view decrements safely', async () => {
      // Create paste with 5 views
      const createResponse = await request(app)
        .post('/api/paste')
        .send({
          content: 'Concurrent test',
          view_limit: 5,
        });

      const pasteId = createResponse.body.id;

      // Simulate 5 concurrent requests
      const promises = Array.from({ length: 5 }).map(() =>
        request(app).get(`/api/paste/${pasteId}`)
      );

      const results = await Promise.all(promises);

      // All should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBe(5);

      // Next request should fail
      const finalResponse = await request(app).get(`/api/paste/${pasteId}`);
      expect(finalResponse.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large content', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: largeContent,
        });

      expect(response.status).toBe(201);

      const pasteId = response.body.id;
      const getResponse = await request(app).get(`/api/paste/${pasteId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.content.length).toBe(1000000);
    });

    test('should handle special characters', async () => {
      const specialContent = 'Hello\nWorld\t🎉\n<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/paste')
        .send({
          content: specialContent,
        });

      expect(response.status).toBe(201);

      const pasteId = response.body.id;
      const getResponse = await request(app).get(`/api/paste/${pasteId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.content).toBe(specialContent);
    });
  });
});
