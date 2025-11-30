import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { config } from '../config/env';
import { logger } from '../common/logger';
import { InternalError, NotFoundError } from '../common/errors';
import { IImageStorageService } from './imageStorageService.interface';

export class ImageStorageService implements IImageStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({ region: config.awsRegion });
    this.bucketName = config.s3BucketName;
  }

  async uploadImage(
    imageId: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: imageId,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      logger.info(`Image uploaded to S3: ${imageId}`);
    } catch (error) {
      logger.error(`S3 upload error: ${(error as Error).message}`);
      throw new InternalError('Failed to upload image to storage');
    }
  }

  async getImage(
    imageId: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: imageId,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new NotFoundError('Image not found in storage');
      }

      const buffer = await this.streamToBuffer(response.Body);
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

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    return Buffer.concat(chunks);
  }
}
