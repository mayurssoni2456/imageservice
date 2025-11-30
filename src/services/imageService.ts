import { v4 as uuidv4 } from 'uuid';
import { ImageStorageService } from './imageStorageService';
import { IImageStorageService } from './imageStorageService.interface';
import { IImageRepository } from '../repositories/imageRepository.interface';
import { ImageRepository } from '../repositories/imageRepository';
import { ImageMetadata } from '../models/imageMetadata.model';
import { logger } from '../common/logger';
import { NotFoundError } from '../common/errors';

export interface UploadResult {
  imageId: string;
  url: string;
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

  async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    contentType: string
  ): Promise<UploadResult> {
    const imageId = uuidv4();

    // Upload to S3
    await this.storageService.uploadImage(imageId, fileBuffer, contentType);

    // Save metadata to DynamoDB
    const metadata: ImageMetadata = {
      imageId,
      originalName,
      contentType,
      size: fileBuffer.length,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await this.imageRepository.save(metadata);
    } catch (error) {
      // Rollback: delete from S3 if metadata save failed
      await this.storageService.deleteImage(imageId);
      throw error;
    }

    logger.info(`Image uploaded successfully: ${imageId}`);

    return {
      imageId,
      url: `/images/${imageId}`,
    };
  }

  async getImage(
    imageId: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    // Check metadata exists
    const metadata = await this.imageRepository.findById(imageId);
    if (!metadata) {
      throw new NotFoundError();
    }

    // Retrieve from S3
    const image = await this.storageService.getImage(imageId);

    logger.info(`Image retrieved successfully: ${imageId}`);
    return image;
  }

  async deleteImage(imageId: string): Promise<void> {
    // Check metadata exists
    const metadata = await this.imageRepository.findById(imageId);
    if (!metadata) {
      throw new NotFoundError();
    }

    // Delete from S3
    await this.storageService.deleteImage(imageId);

    // Delete metadata from DynamoDB
    await this.imageRepository.delete(imageId);

    logger.info(`Image deleted successfully: ${imageId}`);
  }
}
