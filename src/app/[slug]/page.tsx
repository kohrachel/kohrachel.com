import { Suspense, type CSSProperties } from "react";
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
  const cloudsBanner = storage.getPublicUrl(
    BUCKETS.resources,
    "clouds-halftone.png",
  );

  return (
    <>
      {/* Header — full-bleed halftone cloud banner. */}
      <header
        className="relative h-[33vw] min-h-88 w-full sm:min-h-136"
        data-not-typeset
      >
        <img
          src={cloudsBanner}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {/* Title sits over the dark sky in the upper area. */}
        <div className="absolute inset-0 flex flex-col items-center justify-start gap-1 px-6 pt-20 text-center text-[#f5f2e8]">
          <h1 className="font-heading text-[clamp(1.6rem,6vw,4.5rem)]! leading-tight text-primary my-0">
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
      </header>

      {/* Body — the journal page.
          Text width is fixed by --page-padding-inline; the box widens
          independently via --box-gutter without affecting the text. */}
      <div
        className="mt-(--page-padding-top) rounded-lg bg-stone-900/70 pt-0 pb-6 backdrop-blur-xs sm:pt-8 sm:pb-13 md:pt-10 md:pb-16"
        style={
          {
            "--box-gutter": "6rem",
            "--effective-gutter":
              "min(var(--box-gutter), var(--page-padding-inline))",
            marginInline:
              "calc(var(--page-padding-inline) - var(--effective-gutter))",
            paddingInline: "var(--effective-gutter)",
          } as CSSProperties
        }
      >
        {post.content.content.map((node, i) => renderNode(node, i))}
      </div>
    </>
  );
}
