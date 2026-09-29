"use client";

import { Post } from "@/db/schema";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// A little palette of accent colors a card flips to on hover.
const ACCENTS = [
  "#FFD171",
  "#FF8C69",
  "#8ECae6",
  "#A5D6A7",
  "#E5989B",
  "#C9ADA7",
  "#B5EAD7",
  "#FFB3C1",
];

// Card footprint (px) used only to keep cards inside the section bounds.
// Cards themselves grow to fit their text; these are generous estimates.
const CARD_W = 240;
const CARD_H = 220;
const MARGIN = 20;

type CardLayout = {
  top: number;
  left: number;
  rotate: number;
  accent: string;
};

export default function PostSection({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [layouts, setLayouts] = useState<CardLayout[]>([]);

  // Generate genuinely random positions once on the client (after mount, to
  // avoid an SSR/CSR hydration mismatch). Re-rolls each page load.
  useEffect(() => {
    setLayouts(
      posts.map(() => ({
        top: Math.random(),
        left: Math.random(),
        rotate: (Math.random() - 0.5) * 24,
        accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
      })),
    );
  }, [posts]);

  // Measure the section so we can place cards in pixels. A stretched grid
  // item's height isn't a definite containing block for `top: %`, which is
  // why percentage positioning collapsed every card to the top edge.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const availW = Math.max(0, size.w - CARD_W - MARGIN * 2);
  const availH = Math.max(0, size.h - CARD_H - MARGIN * 2);

  return (
    <section
      ref={ref}
      className={`relative min-h-100 self-stretch overflow-hidden rounded-lg border-4 border-black/70 bg-[oklch(0.6937_0.0534_132.56)] ${className}`}
      data-not-typeset
    >
      {posts.length ? (
        posts.map((post, i) => {
          const layout = layouts[i];
          if (!layout) return null;
          const { top, left, rotate, accent } = layout;
          return (
            <Link
              key={post.id}
              href={`/${post.id}`}
              style={
                {
                  top: `${MARGIN + top * availH}px`,
                  left: `${MARGIN + left * availW}px`,
                  "--rotate": `${rotate}deg`,
                  "--accent": accent,
                } as React.CSSProperties
              }
              className="group absolute z-[1] flex w-60 max-sm:w-44 flex-col gap-3 rounded-md border-2 border-black bg-white p-5 text-start text-black no-underline shadow-sm transition-[transform,background-color,z-index] duration-100 [transform:rotate(var(--rotate))] hover:z-50 hover:bg-[var(--accent)] hover:[transform:rotate(0deg)_scale(1.04)] focus-visible:z-50 focus-visible:[transform:rotate(0deg)_scale(1.04)] focus-visible:outline-none"
            >
              <span className="font-heading text-2xl leading-tight group-hover:underline max-sm:text-lg">
                {post.title || "untitled"}
              </span>
              {post.description && (
                <span className="font-sans text-sm italic opacity-80 max-sm:text-xs">
                  {post.description}
                </span>
              )}
            </Link>
          );
        })
      ) : (
        <div className="grid h-full place-items-center opacity-60">
          no documents available
        </div>
      )}

      {/* Credit — card stack UI inspired by Tobias Fried. */}
      <span className="absolute bottom-2 right-3 z-[60] text-xs italic text-black/50">
        card ui inspired by{" "}
        <Link
          href="https://tobiasfried.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black/50 no-underline hover:text-black hover:underline"
        >
          tobias fried
        </Link>
      </span>
    </section>
  );
}
