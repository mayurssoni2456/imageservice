import { APIGatewayProxyEventV2 } from 'aws-lambda';

// Lambda Event Types - extend AWS type
export interface LambdaEvent extends APIGatewayProxyEventV2 {
  // Support for both HTTP API v2 and REST API formats
  httpMethod?: string;
  resource?: string;
}

// Request DTOs
export interface PresignUploadRequest {
  filename?: string;
  contentType?: string;
}

// Response DTOs
export interface PresignUploadResponse {
  imageId: string;
  url: string;
}

export interface ImageResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
}
