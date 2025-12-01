export interface ImageMetadata {
  imageId: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string; // Public S3 URL
  status?: 'pending' | 'uploaded' | 'failed';
}
