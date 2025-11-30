import { ImageService } from '../services/imageService';
import { ApiResponse } from '../common/apiResponse';
import { ValidationError } from '../common/errors';
import { LambdaEvent, PresignUploadResponse } from '../dto/image.dto';

const imageService = new ImageService();

export function presignUpload(_event: LambdaEvent): ApiResponse {
  const result: PresignUploadResponse = {
    imageId: 'placeholder',
    url: `/images/placeholder`,
  };
  return ApiResponse.created({ success: true, data: result });
}

export async function getImage(event: LambdaEvent): Promise<ApiResponse> {
  const id = event.pathParameters?.id;
  if (!id) throw new ValidationError('Image ID is required');

  const { buffer, contentType } = await imageService.getImage(id);
  return ApiResponse.binary(buffer, contentType);
}

export async function deleteImage(event: LambdaEvent): Promise<ApiResponse> {
  const id = event.pathParameters?.id;
  if (!id) throw new ValidationError('Image ID is required');

  await imageService.deleteImage(id);
  return ApiResponse.ok({
    success: true,
    message: 'Image deleted successfully',
  });
}
