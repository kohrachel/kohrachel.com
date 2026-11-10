// Editor reads. Not a "use server" module on purpose: these are only called
// from editor server components, never exposed as server actions. They still
// go through the write gate because they return unpublished posts.

import { requireWriteAccess } from "@/server/auth/gate";
import { getPostService, listAllPostsService } from "@/services/posts/admin";

export async function listAllPosts() {
  requireWriteAccess();
  return listAllPostsService();
}

export async function getPost(id: number) {
  requireWriteAccess();
  return getPostService(id);
}
