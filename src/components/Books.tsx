import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import type { BookType } from "@/domain-types/ui/books";
import { BOOKS } from "@/lib/constants/books";

const SECONDS_PER_BOOK = 4;

export function Books() {
  // Duplicated so the marquee can translate by exactly one copy (-50%) and loop
  // seamlessly back to the start.
  const loop = [...BOOKS, ...BOOKS];
  return (
    <article
      data-not-typeset
      className="-mx-(--home-padding-inline) w-[calc(100%+var(--home-padding-inline)*2)] overflow-hidden"
    >
      <ul
        className="flex w-max bookMarquee"
        style={
          {
            "--marquee-duration": `${BOOKS.length * SECONDS_PER_BOOK}s`,
          } as React.CSSProperties
        }
      >
        {loop.map(({ title, author, coverSrc, externalUrl, numPages }, i) => (
          <li
            key={`${title}-${i}`}
            aria-hidden={i >= BOOKS.length}
            className="mr-5 w-44 shrink-0"
          >
            <Book
              title={title}
              author={author}
              coverSrc={coverSrc}
              externalUrl={externalUrl}
              numPages={numPages}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}

// Book spine thickness, derived from page count. Bucketed into fixed tiers so
// `--book-height` can be a static Tailwind class (no inline styles). Each
// returned string must be a literal so Tailwind can detect it at build time.
function getBookThicknessClass(numPages: number): string {
  if (numPages <= 120) return "[--book-height:12px]";
  if (numPages <= 250) return "[--book-height:20px]";
  if (numPages <= 400) return "[--book-height:30px]";
  if (numPages <= 600) return "[--book-height:44px]";
  return "[--book-height:60px]";
}

export function Book({
  title,
  author,
  coverSrc,
  externalUrl,
  numPages,
}: BookType) {
  const bookThicknessClass = getBookThicknessClass(numPages);
  return (
    <Link
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full rounded-xl bg-stone-800 border border-stone-700 p-8 md:p-12 hover:bg-accent/70 transition-colors duration-500 aspect-3/4 min-w-44"
    >
      <div className="flex justify-center items-center perspective-normal">
        <div className="text-left absolute -top-4 md:-top-6 -inset-x-4 md:-inset-x-6 opacity-0 -translate-y-4 md:-translate-y-6 transition-[opacity,translate] duration-500 ease-in-out group-hover:opacity-100 group-hover:-translate-y-1 md:group-hover:-translate-y-2 flex flex-col">
          <span className="leading-5 md:leading-7 text-primary">{title}</span>
          <span className="text-base text-gray-600">{author}</span>
        </div>
        <div
          className={`relative shrink-0 w-full max-w-30 transform-3d origin-center transition-transform duration-500 ease-in-out group-hover:rotate-x-80 group-hover:rotate-z-45 group-hover:scale-75 after:block after:content-[""] after:bg-gray-100 after:w-[calc(100%+0.5px)] after:absolute after:left-0 after:rounded-l-md after:border-y-[3px] after:border-l-4 after:border-gray-800 before:block before:content-[""] before:bg-white before:h-[calc(100%+0.5px)] before:absolute before:right-0 before:top-0 before:border-x-[3px] before:border-x-gray-800 before:border-t-[3px] before:border-t-gray-200 bookThreeD ${bookThicknessClass}`}
        >
          <img src={coverSrc} alt={title} className="block w-full" />
        </div>
        <div className="absolute font-bold text-sm -bottom-5 md:-bottom-7 -inset-x-4 md:-inset-x-6 opacity-0 translate-y-3 md:translate-y-4 transition-[opacity,translate] duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
          <span className="inline-flex items-center underline decoration-dotted underline-offset-[6px] decoration-2">
            Goodreads
            <HugeiconsIcon icon={ArrowUpRight01Icon} />
          </span>
        </div>
      </div>
    </Link>
  );
}
