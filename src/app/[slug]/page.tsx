import { Suspense } from "react";
import { notFound } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderNode } from "@/services/posts/render";
import { getPostBannerUrl } from "@/services/posts/banner";
import { humanDate } from "@/lib/utils";
import { PostHeader } from "@/components/post/post-header";
import { PostBody } from "@/components/post/post-body";

// Prerender every published post at build time, so a post link prefetches the
// full post and opens without the "Loading…" fallback. Posts published after
// the build are rendered on first visit and cached; `revalidatePostTags` still
// refreshes edited posts.
export async function generateStaticParams() {
  const posts = await listPosts({});
  return posts.map((post) => ({ slug: String(post.id) }));
}

export default function SinglePost({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({
  params,
}: {
  params: PageProps<"/[slug]">["params"];
}) {
  const { slug } = await params;
  const id = Number(slug);
  const [post] = await listPosts({ postIds: [id] });
  if (!post || !post.content.content) notFound();

  const { title, description, publishedAt, createdAt } = post;

  return (
    <>
      <PostHeader
        bannerUrl={getPostBannerUrl()}
        title={title}
        description={description || null}
        date={humanDate(publishedAt ?? createdAt)}
      />
      <PostBody>
        {post.content.content.map((node, i) => renderNode(node, i))}
      </PostBody>
    </>
  );
}
