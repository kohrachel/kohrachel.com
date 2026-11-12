import { z } from "zod";

export const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const POST_IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;

export type PostImageType = keyof typeof POST_IMAGE_TYPES;

export const postImageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= POST_IMAGE_MAX_BYTES, "Image is over 5MB")
  .refine(
    (file) => file.type in POST_IMAGE_TYPES,
    "Image must be PNG, JPEG, WebP, GIF or AVIF",
  );
