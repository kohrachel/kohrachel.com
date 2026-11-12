import { randomUUID } from "node:crypto";
import { BUCKETS, storage } from "@/services/storage";
import {
  POST_IMAGE_TYPES,
  type PostImageType,
} from "@/domain-types/posts/image";

export async function uploadPostImageService(file: File) {
  const bucket = BUCKETS.postImages;
  const ext = POST_IMAGE_TYPES[file.type as PostImageType];
  const key = await storage.upload(
    bucket,
    `${randomUUID()}.${ext}`,
    file,
    file.type,
  );
  return { bucket, key };
}
