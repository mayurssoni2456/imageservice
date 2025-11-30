import { ImageService } from '../services/imageService';
import { ApiResponse } from '../common/apiResponse';
import { ValidationError } from '../common/errors';
import {
  LambdaEvent,
  PresignUploadRequest,
  PresignUploadResponse,
} from '../dto/image.dto';
import { getLogger } from '../common/logger';

const logger = getLogger('ImageController');
const imageService = new ImageService();

export async function presignUpload(event: LambdaEvent): Promise<ApiResponse> {
  const body: PresignUploadRequest = event.body
    ? (JSON.parse(event.body) as PresignUploadRequest)
    : {};
  logger.info('PresignUpload invoked', event);

  const { filename, contentType } = body;

  if (!filename || !contentType) {
    logger.warn('PresignUpload validation failed', event, {
      filename,
      contentType,
    });
    throw new ValidationError('filename and contentType are required');
  }

  const result = await imageService.generatePresignedUpload(
    filename,
    contentType
  );
  logger.info('PresignUpload URL generated', event, {
    imageId: result.imageId,
    uploadUrl: result.uploadUrl,
  });

  const response: PresignUploadResponse = {
    imageId: result.imageId,
    url: result.uploadUrl,
  };

  return ApiResponse.created({ success: true, data: response });
}

export async function getImage(event: LambdaEvent): Promise<ApiResponse> {
  logger.info('getImage invoked', event);
  const id = event.pathParameters?.id;
  if (!id) throw new ValidationError('Image ID is required');

  const { buffer, contentType } = await imageService.getImage(id);
  logger.info('getImage success', event, { id, contentType });
  return ApiResponse.binary(buffer, contentType);
}

export async function deleteImage(event: LambdaEvent): Promise<ApiResponse> {
  logger.info('deleteImage invoked', event);
  const id = event.pathParameters?.id;
  if (!id) throw new ValidationError('Image ID is required');

  await imageService.deleteImage(id);
  logger.info('deleteImage success', event, { id });
  return ApiResponse.ok({
    success: true,
    message: 'Image deleted successfully',
  });
}
