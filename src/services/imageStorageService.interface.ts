export interface IImageStorageService {
  uploadImage(
    imageId: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<void>;
  getImage(imageId: string): Promise<{ buffer: Buffer; contentType: string }>;
  deleteImage(imageId: string): Promise<void>;
}
