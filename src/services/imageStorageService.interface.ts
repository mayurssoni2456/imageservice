export interface IImageStorageService {
  getPresignedUploadUrl(
    imageId: string,
    contentType: string,
    expiresIn?: number
  ): Promise<string>;
  getImage(imageId: string): Promise<{ buffer: Buffer; contentType: string }>;
  deleteImage(imageId: string): Promise<void>;
}
