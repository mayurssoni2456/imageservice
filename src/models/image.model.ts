export interface Image {
  buffer: Buffer;
  contentType: string;
  metadata?: {
    imageId: string;
    originalName: string;
    size: number;
    uploadedAt: string;
  };
}
