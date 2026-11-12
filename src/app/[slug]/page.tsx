import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderPostContent } from "@/services/posts/render";
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
  return posts.flatMap((post) => (post.slug ? [{ slug: post.slug }] : []));
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

  // Posts used to live at /<id>. Slugs are never purely numeric, so a numeric
  // param is an old link: send it to the post's slug URL.
  if (/^\d+$/.test(slug)) {
    const id = Number(slug);
    if (!Number.isSafeInteger(id) || id <= 0) notFound();
    const [byId] = await listPosts({ postIds: [id] });
    if (!byId?.slug) notFound();
    permanentRedirect(`/${byId.slug}`);
  }

  const [post] = await listPosts({ slug });
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
      <PostBody>{renderPostContent(post.content)}</PostBody>
    </>
  );
}
