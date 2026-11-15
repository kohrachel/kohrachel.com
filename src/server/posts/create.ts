"use server";

import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/server/auth/gate";
import { createPostService } from "@/services/posts/create";

/** Creates an empty draft and opens it in the editor. */
export async function createPost() {
  await requireWriteAccess();
  const row = await createPostService();
  redirect(`/editor/${row.id}`);
}
