import request from 'supertest';
import app from '../src/index';

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Welcome to Image Service API');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /health/greet', () => {
    it('should greet with valid name', async () => {
      const response = await request(app)
        .post('/health/greet')
        .send({ name: 'TypeScript' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hello TypeScript!');
    });

    it('should reject invalid input', async () => {
      const response = await request(app).post('/health/greet').send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
