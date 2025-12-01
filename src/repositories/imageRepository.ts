import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { IImageRepository } from './imageRepository.interface';
import { ImageMetadata } from '../models/imageMetadata.model';
import { config } from '../config/env';
import { InternalError } from '../common/errors';
import { getLogger } from '../common/logger';
import { ImageMetadataUpdate } from '../models/imageMetadataUpdate.model';

const logger = getLogger('ImageRepository');

export class ImageRepository implements IImageRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    logger.info('ImageRepository config', {
      awsRegion: config.awsRegion,
      tableName: config.dynamoTableName,
    });
    const client = new DynamoDBClient({ region: config.awsRegion });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = config.dynamoTableName;
  }

  async save(metadata: ImageMetadata): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: metadata,
      });

      await this.docClient.send(command);
      logger.info(`Metadata saved: ${metadata.imageId}`);
    } catch (error) {
      logger.error(`Repository save error: ${(error as Error).message}`);
      throw new InternalError('Failed to save image metadata');
    }
  }

  async update(metadata: ImageMetadataUpdate): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { imageId: metadata.imageId },
        UpdateExpression: 'SET #url = :url, #status = :status',
        ExpressionAttributeNames: {
          '#url': 'url',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':url': metadata.url,
          ':status': metadata.status,
        },
      });
      await this.docClient.send(command);

      logger.info(`Metadata updated: ${metadata.imageId}`);
    } catch (error) {
      logger.error(`Repository update error: ${(error as Error).message}`);
      throw new InternalError('Failed to update image metadata');
    }
  }

  async findById(imageId: string): Promise<ImageMetadata | null> {
    try {
      logger.info(
        `Querying DynamoDB: Table=${this.tableName}, Key=${JSON.stringify({ imageId })}`
      );
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { imageId },
      });

      const response = await this.docClient.send(command);

      logger.info(`DynamoDB response: ${JSON.stringify(response)}`);

      if (!response.Item) {
        return null;
      }

      logger.info(`Metadata retrieved: ${imageId}`);
      return response.Item as ImageMetadata;
    } catch (error) {
      logger.error(`Repository findById error: ${(error as Error).message}`);
      throw new InternalError('Failed to retrieve image metadata');
    }
  }

  async delete(imageId: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { imageId },
      });

      await this.docClient.send(command);
      logger.info(`Metadata deleted: ${imageId}`);
    } catch (error) {
      logger.error(`Repository delete error: ${(error as Error).message}`);
      throw new InternalError('Failed to delete image metadata');
    }
  }
}
