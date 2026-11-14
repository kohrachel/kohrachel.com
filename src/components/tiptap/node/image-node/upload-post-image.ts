import type { Editor } from "@tiptap/react";
import { postImageUploadSchema } from "@/domain-types/posts/image";
import { focusNextNode } from "@/lib/tiptap-utils";
import { createPostImageUpload } from "@/server/posts/upload-image";

export type UploadedImageAttrs = {
  bucket: string;
  key: string;
  width: number;
  height: number;
};

export async function uploadPostImageFile(
  file: File,
): Promise<UploadedImageAttrs> {
  const parsed = postImageUploadSchema.safeParse({
    type: file.type,
    size: file.size,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid image");
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();

  const { bucket, key, url } = await createPostImageUpload(parsed.data);
  const res = await fetch(url, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Upload failed (${res.status})`);
  }
  return { bucket, key, width, height };
}

export function altFromFilename(file: File) {
  return file.name.replace(/\.[^/.]+$/, "") || "image";
}

export async function insertUploadedImages(
  editor: Editor,
  files: File[],
  pos: number,
  onError: (error: Error) => void,
) {
  const results = await Promise.allSettled(files.map(uploadPostImageFile));
  const images = results.flatMap((result, i) => {
    if (result.status === "fulfilled") {
      return [
        {
          type: "image",
          attrs: { ...result.value, alt: altFromFilename(files[i]) },
        },
      ];
    }
    onError(
      result.reason instanceof Error
        ? result.reason
        : new Error("Upload failed"),
    );
    return [];
  });
  if (images.length > 0) {
    editor.chain().focus().insertContentAt(pos, images).run();
    focusNextNode(editor);
  }
}
