import { ImageMetadata } from '../models/imageMetadata.model';

export interface IImageRepository {
  save(metadata: ImageMetadata): Promise<void>;
  findById(imageId: string): Promise<ImageMetadata | null>;
  delete(imageId: string): Promise<void>;
}
