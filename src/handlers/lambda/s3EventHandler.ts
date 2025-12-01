import { S3Event, S3Handler } from 'aws-lambda';
import { ImageRepository } from '../../repositories/imageRepository';
import { getLogger } from '../../common/logger';
import { config } from '../../config/env';

const logger = getLogger('S3EventHandler');
const imageRepository = new ImageRepository();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    try {
      const bucket = record.s3.bucket.name;
      const key = record.s3.object.key;
      const imageId = key;

      const publicUrl = `https://${bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;

      // Update DynamoDB record with publicUrl and status
      await imageRepository.update({
        imageId,
        size: 0,
        url: publicUrl,
        status: 'uploaded',
      });

      logger.info('Updated image metadata', { imageId, publicUrl });
    } catch (error) {
      logger.error('Failed to update image metadata', { error });
    }
  }
};
