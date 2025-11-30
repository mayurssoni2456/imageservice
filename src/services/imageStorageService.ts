import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env';
import { InternalError, NotFoundError } from '../common/errors';
import { IImageStorageService } from './imageStorageService.interface';
import { getLogger } from '../common/logger';

const logger = getLogger('ImageStorageService');

export class ImageStorageService implements IImageStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({ region: config.awsRegion });
    this.bucketName = config.s3BucketName;
  }

  async getPresignedUploadUrl(
    imageId: string,
    contentType: string,
    expiresIn = 300
  ): Promise<string> {
    logger.info('getPresignedUploadUrl called', {
      imageId,
      contentType,
      expiresIn,
    });
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: imageId,
        // Don't include ContentType here - let client set it during upload
        // This avoids signature mismatch if client doesn't send exact header
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      logger.info(`Presigned URL generated for: ${imageId}`);
      return signedUrl;
    } catch (error) {
      logger.error(
        `S3 presigned URL generation error: ${(error as Error).message}`
      );
      throw new InternalError('Failed to generate presigned upload URL');
    }
  }

  async getImage(
    imageId: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    logger.info('getImage called', { imageId });
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: imageId,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new NotFoundError('Image not found in storage');
      }

      const buffer = Buffer.from(await response.Body.transformToByteArray());
      const contentType = response.ContentType || 'application/octet-stream';

      logger.info(`Image retrieved from S3: ${imageId}`);
      return { buffer, contentType };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`S3 get error: ${(error as Error).message}`);
      throw new InternalError('Failed to retrieve image from storage');
    }
  }

  async deleteImage(imageId: string): Promise<void> {
    logger.info('deleteImage called', { imageId });
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: imageId,
      });

      await this.s3Client.send(command);
      logger.info(`Image deleted from S3: ${imageId}`);
    } catch (error) {
      logger.error(`S3 delete error: ${(error as Error).message}`);
      throw new InternalError('Failed to delete image from storage');
    }
  }
}
