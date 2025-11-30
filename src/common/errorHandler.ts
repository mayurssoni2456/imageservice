import { ApiResponse } from './apiResponse';
import { ValidationError, NotFoundError, BaseError } from './errors';
import { getLogger } from './logger';

const logger = getLogger('');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleError(error: unknown, event?: any): ApiResponse {
  if (error instanceof ValidationError) {
    return ApiResponse.badRequest(error.message);
  }

  if (error instanceof NotFoundError) {
    return ApiResponse.notFound(error.message);
  }

  if (error instanceof BaseError) {
    logger.error('Business error', event, error);
    return ApiResponse.internalError(error.message);
  }

  // Unexpected errors - safely handle unknown type
  if (error instanceof Error) {
    logger.error('Unexpected error', event, error);
    return ApiResponse.internalError('An unexpected error occurred');
  }

  // Non-Error objects (strings, numbers, etc.)
  logger.error('Unknown error type', event, new Error(String(error)));
  return ApiResponse.internalError('An unexpected error occurred');
}
