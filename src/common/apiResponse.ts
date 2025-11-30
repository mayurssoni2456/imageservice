export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export class ApiResponse {
  constructor(
    public statusCode: number,
    public body: string,
    public headers?: Record<string, string>,
    public isBase64Encoded?: boolean
  ) {}

  static json(statusCode: number, payload: unknown): ApiResponse {
    return new ApiResponse(statusCode, JSON.stringify(payload));
  }

  static ok(payload: unknown): ApiResponse {
    return ApiResponse.json(HttpStatus.OK, payload);
  }

  static created(payload: unknown): ApiResponse {
    return ApiResponse.json(HttpStatus.CREATED, payload);
  }

  static badRequest(message: string): ApiResponse {
    return ApiResponse.json(HttpStatus.BAD_REQUEST, {
      success: false,
      error: message,
    });
  }

  static notFound(message: string): ApiResponse {
    return ApiResponse.json(HttpStatus.NOT_FOUND, {
      success: false,
      error: message,
    });
  }

  static internalError(message: string = 'Internal Server Error'): ApiResponse {
    return ApiResponse.json(HttpStatus.INTERNAL_ERROR, {
      success: false,
      error: message,
    });
  }

  static binary(buffer: Buffer, contentType: string): ApiResponse {
    return new ApiResponse(
      HttpStatus.OK,
      buffer.toString('base64'),
      { 'Content-Type': contentType },
      true
    );
  }
}
