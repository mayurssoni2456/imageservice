export class BaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Image not found') {
    super(message, 404);
  }
}

export class InternalError extends BaseError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500);
  }
}

export function toStatusCode(err: unknown): number {
  if (err instanceof BaseError) return err.statusCode;
  return 500;
}
