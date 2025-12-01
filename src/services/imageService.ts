import { v4 as uuidv4 } from 'uuid';
import { ImageStorageService } from './imageStorageService';
import { IImageStorageService } from './imageStorageService.interface';
import { IImageRepository } from '../repositories/imageRepository.interface';
import { ImageRepository } from '../repositories/imageRepository';
import { ImageMetadata } from '../models/imageMetadata.model';
import { getLogger } from '../common/logger';

const logger = getLogger('ImageService');

export interface PresignUploadResult {
  imageId: string;
  uploadUrl: string;
}

export class ImageService {
  private storageService: IImageStorageService;
  private imageRepository: IImageRepository;

  constructor(
    storageService?: IImageStorageService,
    imageRepository?: IImageRepository
  ) {
    this.storageService = storageService || new ImageStorageService();
    this.imageRepository = imageRepository || new ImageRepository();
  }

  async generatePresignedUpload(
    originalName: string,
    contentType: string
  ): Promise<PresignUploadResult> {
    logger.info('generatePresignedUpload called', {
      fileName: originalName,
      fileType: contentType,
    });
    const imageId = uuidv4();

    // Generate presigned URL (5 min expiry)
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      imageId,
      contentType,
      300
    );

    // Save initial metadata (status: pending upload)
    const metadata: ImageMetadata = {
      imageId,
      originalName,
      contentType,
      size: 0, // Unknown until upload completes
      url: '', // Public S3 URL will be set after upload
      uploadedAt: new Date().toISOString(),
      status: 'pending',
    };

    await this.imageRepository.save(metadata);

    logger.info(`Presigned upload URL generated for: ${imageId}`);

    return {
      imageId,
      uploadUrl,
    };
  }

  async getImageMetaData(imageId: string): Promise<ImageMetadata | null> {
    logger.info('getImageMetaData called', { imageId });
    // Check metadata exists
    const metadata = await this.imageRepository.findById(imageId);
    if (!metadata) {
      return null;
    }

    // Retrieve from S3
    // const image = await this.storageService.getImage(imageId);

    logger.info(`getImageMetaData retrieved successfully: ${imageId}`);
    return metadata;
  }

  async deleteImage(imageId: string): Promise<void> {
    logger.info('deleteImage called', { imageId });
    // Check metadata exists
    const metadata = await this.imageRepository.findById(imageId);
    if (!metadata) {
      return;
    }

    // Delete from S3
    await this.storageService.deleteImage(imageId);

    // Delete metadata from DynamoDB
    await this.imageRepository.delete(imageId);

    logger.info(`Image deleted successfully: ${imageId}`);
  }
}
