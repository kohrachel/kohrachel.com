import Link from "next/link";
import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { listPosts } from "@/server/posts/list";
import { storage, BUCKETS } from "@/services/storage";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

const HEADER_VARIANTS = 5;

export default async function Home() {
  const posts = await listPosts({});
  const variants = Array.from({ length: HEADER_VARIANTS }, (_, i) => i + 1);
  const rachelSrcs = variants.map((n) =>
    storage.getPublicUrl(BUCKETS.resources, `rachel-${n}.PNG`),
  );
  const kohSrcs = variants.map((n) =>
    storage.getPublicUrl(BUCKETS.resources, `koh-${n}.PNG`),
  );
  return (
    <main className="text-center flex flex-col gap-8 px-(--home-padding-inline) pt-(--home-padding-top) pb-(--home-padding-bottom)">
      <Header rachelSrcs={rachelSrcs} kohSrcs={kohSrcs} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="grid grid-cols-2 lg:col-span-4 lg:grid-cols-subgrid gap-6">
          <MusicArticle />
          <MusicArticle />
        </div>

        <PostSection posts={posts} className="lg:col-span-8" />
      </div>
      <Books />
    </main>
  );
}

export function MusicArticle() {
  return (
    <article className="lg:col-span-4 bg-stone-200 px-4 pt-5 pb-12">
      <div className="bg-stone-900 size-full">books</div>
    </article>
  );
}
export function Books() {
  const { title, author, coverSrc } = {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    coverSrc:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg",
  };
  return (
    <article className="" data-not-typeset>
      <ul className="flex gap-5">
        <Book title={title} author={author} coverSrc={coverSrc} />
        <Book title={title} author={author} coverSrc={coverSrc} />
        <Book title={title} author={author} coverSrc={coverSrc} />
      </ul>
    </article>
  );
}

export function Book({
  title,
  author,
  coverSrc,
}: {
  title: string;
  author: string;
  coverSrc: string;
}) {
  return (
    <Link
      href="/"
      className="block w-full rounded-xl bg-stone-800 border border-stone-700 p-16 hover:bg-accent/70 transition-colors duration-500 bookPerspectiveContainer"
    >
      <div className="flex justify-center items-center bookPerspective">
        <div className="text-left absolute -top-6 -inset-x-6 opacity-0 -translate-y-4 bookMetaText">
          <h3 className="text-lg font-bold leading-1.2 text-primary">
            {title}
          </h3>
          <p className="text-base text-gray-600">{author}</p>
        </div>
        <div
          className='relative shrink-0 w-full max-w-30 after:block after:content-[""] after:bg-gray-100 after:w-[calc(100%+0.5px)] after:absolute after:left-0 after:rounded-l-md after:border-y-[3px] after:border-l-4 after:border-gray-800 before:block before:content-[""] before:bg-white before:h-[calc(100%+0.5px)] before:absolute before:right-0 before:top-0 before:border-x-[3px] before:border-x-gray-800 before:border-t-[3px] before:border-t-gray-200 bookThreeD'
          style={{ "--book-height": "32px" } as React.CSSProperties}
        >
          <img
            src={coverSrc}
            alt={title}
            className="block w-full rounded-[3px]"
          />
        </div>
        <div className="absolute font-bold text-sm -bottom-6 -inset-x-6 opacity-0 translate-y-4 bookMetaText">
          <span className="inline-flex items-center underline decoration-dotted underline-offset-[6px] decoration-2">
            View on Goodreads
            <HugeiconsIcon icon={ArrowUpRight01Icon} />
          </span>
        </div>
      </div>
    </Link>
  );
}
