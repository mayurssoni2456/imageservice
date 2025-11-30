import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3BucketName: process.env.S3_BUCKET_NAME || 'image-service-bucket',
  dynamoTableName: process.env.DYNAMODB_TABLE_NAME || 'ImageMetadata',
};
