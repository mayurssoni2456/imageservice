export interface ImageMetadataUpdate {
  imageId: string;
  url?: string;
  status?: 'pending' | 'uploaded' | 'failed';
  size?: number;
}
