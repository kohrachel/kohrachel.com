import { randomUUID } from "node:crypto";
import { BUCKETS, storage } from "@/services/storage";
import {
  POST_IMAGE_TYPES,
  type PostImageUpload,
} from "@/domain-types/posts/image";

export async function createPostImageUploadService({ type }: PostImageUpload) {
  const bucket = BUCKETS.postImages;
  const key = `${randomUUID()}.${POST_IMAGE_TYPES[type]}`;
  const { url } = await storage.createUploadUrl(bucket, key);
  return { bucket, key, url };
}
