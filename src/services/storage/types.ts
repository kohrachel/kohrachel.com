export type UploadBody = Buffer | Blob | ArrayBuffer | Uint8Array;

export interface CreateUploadUrl {
  url: string;
  fields?: Record<string, string>;
}

export interface StorageService {
  /**
   * Upload bytes to `bucket/key`, overwriting if it exists.
   * Returns the object key
   */
  upload(
    bucket: string,
    key: string,
    body: UploadBody,
    contentType: string,
  ): Promise<string>;

  /** Remove an object. No-op if it doesn't exist. */
  delete(bucket: string, key: string): Promise<void>;

  /** Stable public URL for objects in public buckets. */
  getPublicUrl(bucket: string, key: string): string;

  /** Time-limited signed URL for objects in private buckets. */
  getSignedUrl(
    bucket: string,
    key: string,
    expiresInSec: number,
  ): Promise<string>;

  /** Presigned target for direct browser -> storage uploads. */
  createUploadUrl(bucket: string, key: string): Promise<CreateUploadUrl>;
}
