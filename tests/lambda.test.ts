import { handler } from '../src/handlers/api/handler';
import { LambdaEvent } from '../src/dto/image.dto';

// Mock uuid to avoid ESM import issues in Jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-12345'),
}));

// Mock AWS SDK to avoid real AWS calls in tests
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest
    .fn()
    .mockResolvedValue('https://s3.amazonaws.com/presigned-url'),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({ Item: null }),
    })),
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

describe('Lambda Handler - API Gateway Events', () => {
  describe('GET /images/{id}', () => {
    it('should return 400 when imageId is missing', async () => {
      const event = {
        routeKey: 'GET /images/{id}',
        pathParameters: {},
        requestContext: {
          http: { method: 'GET' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/images/',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        error: 'Image ID is required',
      });
    });

    it('should return 204 when image does not exist', async () => {
      const event = {
        routeKey: 'GET /images/{id}',
        pathParameters: { id: 'non-existent-id' },
        requestContext: {
          http: { method: 'GET' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/images/non-existent-id',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(204);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        message: '',
      });
    });
  });

  describe('DELETE /images/{id}', () => {
    it('should return 400 when imageId is missing', async () => {
      const event = {
        routeKey: 'DELETE /images/{id}',
        pathParameters: {},
        requestContext: {
          http: { method: 'DELETE' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/images/',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        error: 'Image ID is required',
      });
    });

    it('should return 204 when trying to delete non-existent image', async () => {
      const event = {
        routeKey: 'DELETE /images/{id}',
        pathParameters: { id: 'non-existent-id' },
        requestContext: {
          http: { method: 'DELETE' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/images/non-existent-id',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(204);
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        message: '',
      });
    });
  });

  describe('POST /images/presign', () => {
    it('should return presigned URL placeholder', async () => {
      const event = {
        routeKey: 'POST /images/presign',
        body: JSON.stringify({
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        }),
        requestContext: {
          http: { method: 'POST' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/images/presign',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('imageId');
      expect(body.data).toHaveProperty('url');
    });
  });

  describe('Unknown route', () => {
    it('should return 404 for unknown routes', async () => {
      const event = {
        routeKey: 'GET /unknown',
        requestContext: {
          http: { method: 'GET' },
          requestId: 'test-request-id',
        } as any,
        rawPath: '/unknown',
        version: '2.0',
        rawQueryString: '',
        headers: {},
        isBase64Encoded: false,
      } as LambdaEvent;

      const result: any = await handler(event);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        error: 'Route not found',
      });
    });
  });
});
