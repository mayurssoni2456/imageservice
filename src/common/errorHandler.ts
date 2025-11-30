import { ApiResponse } from './apiResponse';
import { ValidationError, NotFoundError, BaseError } from './errors';
import { logger } from './logger';

export function handleError(error: unknown): ApiResponse {
  if (error instanceof ValidationError) {
    return ApiResponse.badRequest(error.message);
  }

  if (error instanceof NotFoundError) {
    return ApiResponse.notFound(error.message);
  }

  if (error instanceof BaseError) {
    logger.error('Business error:', error.message);
    return ApiResponse.internalError(error.message);
  }

  // Unexpected errors
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error('Unexpected error:', { message, error });
  return ApiResponse.internalError('An unexpected error occurred');
}
