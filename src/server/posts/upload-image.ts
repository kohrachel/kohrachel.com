"use server";

import { requireWriteAccess } from "@/server/auth/gate";
import { createPostImageUploadService } from "@/services/posts/images";
import {
  postImageUploadSchema,
  type PostImageUpload,
} from "@/domain-types/posts/image";

export async function createPostImageUpload(input: PostImageUpload) {
  requireWriteAccess();
  return createPostImageUploadService(postImageUploadSchema.parse(input));
}
