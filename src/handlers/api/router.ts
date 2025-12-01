import * as imageController from '../../controllers/imageController';
import { ApiResponse } from '../../common/apiResponse';
import { handleError } from '../../common/errorHandler';
import { LambdaEvent } from '../../dto/image.dto';

type Handler = (event: LambdaEvent) => Promise<ApiResponse> | ApiResponse;

const routes: Record<string, Handler> = {
  'POST /images/presign': imageController.presignUpload,
  'GET /images/{id}': imageController.getImage,
  'DELETE /images/{id}': imageController.deleteImage,
};

export async function dispatch(event: LambdaEvent): Promise<ApiResponse> {
  try {
    const key = event.routeKey ?? `${event.httpMethod} ${event.resource}`;
    const handler = routes[key];
    return handler
      ? await handler(event)
      : ApiResponse.notFound('Route not found');
  } catch (error) {
    return handleError(error);
  }
}
