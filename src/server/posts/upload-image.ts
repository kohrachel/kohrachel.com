"use server";

import { requireWriteAccess } from "@/server/auth/gate";
import { uploadPostImageService } from "@/services/posts/images";
import { postImageFileSchema } from "@/domain-types/posts/image";

export async function uploadPostImage(formData: FormData) {
  requireWriteAccess();
  const file = postImageFileSchema.parse(formData.get("file"));
  return uploadPostImageService(file);
}
