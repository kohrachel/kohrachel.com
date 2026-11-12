import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPost } from "@/server/posts/admin";
import { getPostBannerUrl } from "@/services/posts/banner";
import { PostShell } from "@/components/post/post-shell";
import { EditorWithSave } from "../editor-with-save";

export default function EditPostPage({ params }: PageProps<"/editor/[id]">) {
  // Editor data is uncached and per-request, and the Tiptap editor reads
  // unstable values (e.g. Math.random()) during render, so this streams as
  // dynamic content instead of being prerendered into the static shell.
  return (
    <PostShell backHref="/editor" backLabel="All posts">
      <Suspense fallback={null}>
        <EditPost params={params} />
      </Suspense>
    </PostShell>
  );
}

async function EditPost({
  params,
}: {
  params: PageProps<"/editor/[id]">["params"];
}) {
  await connection();
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const post = await getPost(postId);
  if (!post) notFound();

  return (
    <EditorWithSave
      // Remount when switching posts so editor state doesn't carry over.
      key={post.id}
      bannerUrl={getPostBannerUrl()}
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
        hasDraft: post.hasDraft,
      }}
    />
  );
}
