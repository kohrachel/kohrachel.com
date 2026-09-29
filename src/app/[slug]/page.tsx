import { Suspense } from "react";
import { notFound } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderNode } from "@/services/posts/render";
import { humanDate } from "@/lib/utils";
import { storage, BUCKETS } from "@/services/storage";

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

  const { title, description, createdAt } = post;
  const kodakFrame = storage.getPublicUrl(BUCKETS.resources, "kodak-frame-1.png");

  return (
    <>
      {/* Header — a Kodak film frame with the flower photo + title in the window */}
      <article
        className="relative aspect-836/535 w-auto mx-[calc(var(--page-padding-inline)*-0.6)]"
        data-not-typeset
      >
        {/* Content aligned to the frame's transparent 16:9 window. */}
        <div className="absolute left-[6.699%] top-[17.009%] w-[83.971%] h-[73.645%] overflow-hidden">
          <img
            src="/flowers-blur.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-[8%] text-center text-[#f5f2e8] drop-shadow-md">
            <h1 className="mt-0! mb-0! font-heading text-[clamp(1.6rem,6vw,4.5rem)]! leading-tight">
              {title}
            </h1>
            {description && (
              <span className="font-sans italic text-[clamp(1rem,2.6vw,1.6rem)]">
                {description}
              </span>
            )}
            <span className="font-sans text-[clamp(0.8rem,1.8vw,1.15rem)]">
              {humanDate(createdAt)}
            </span>
          </div>
        </div>
        {/* Frame overlays the content; its center is transparent. */}
        <img
          src={kodakFrame}
          alt=""
          className="absolute inset-0 size-full pointer-events-none select-none"
        />
      </article>

      {/* Body — the journal page */}
      <div className="relative">
        <div className="absolute -inset-x-14 -inset-y-8 -z-10 rounded-lg bg-stone-900" />
        {post.content.content.map((node, i) => renderNode(node, i))}
      </div>
    </>
  );
}
