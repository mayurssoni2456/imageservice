export type ApiResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
};

export const json = (statusCode: number, payload: unknown): ApiResponse => ({
  statusCode,
  body: JSON.stringify(payload),
});

export const badRequest = (msg: string): ApiResponse =>
  json(400, { success: false, error: msg });
export const notFound = (msg: string): ApiResponse =>
  json(404, { success: false, error: msg });
export const serverError = (): ApiResponse =>
  json(500, { success: false, error: 'Internal Server Error' });
