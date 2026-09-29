"use client";

import { Post } from "@/db/schema";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// A Next.js <Link> that can be animated by Motion.
const MotionLink = motion.create(Link);

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
        <AnimatePresence>
          {size.h > 0 &&
            posts.map((post, i) => {
              const layout = layouts[i];
              if (!layout) return null;
              const { top, left, rotate, accent } = layout;
              const finalTop = MARGIN + top * availH;
              const finalLeft = MARGIN + left * availW;
              return (
                <MotionLink
                  key={post.id}
                  href={`/${post.id}`}
                  className="group absolute flex w-60 max-sm:w-44 flex-col gap-3 rounded-md border-2 border-black p-5 text-start text-black no-underline shadow-sm focus-visible:outline-none"
                  style={{ backgroundColor: "#ffffff", zIndex: 1 }}
                  // Fan out from the bottom-center of the section.
                  initial={{
                    top: size.h,
                    left: size.w / 2 - CARD_W / 2,
                    rotate: 0,
                    scale: 0.6,
                    opacity: 0,
                  }}
                  animate={{
                    top: finalTop,
                    left: finalLeft,
                    rotate,
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 120,
                      damping: 16,
                      delay: i * 0.07,
                    },
                  }}
                  exit={{
                    top: size.h,
                    left: size.w / 2 - CARD_W / 2,
                    rotate: 0,
                    scale: 0.6,
                    opacity: 0,
                    transition: { duration: 0.25 },
                  }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.05,
                    zIndex: 50,
                    backgroundColor: accent,
                    transition: { duration: 0.15 },
                  }}
                  whileTap={{ scale: 0.97, zIndex: 50 }}
                >
                  <span className="font-heading text-2xl leading-tight group-hover:underline max-sm:text-lg">
                    {post.title || "untitled"}
                  </span>
                  {post.description && (
                    <span className="font-sans text-sm italic opacity-80 max-sm:text-xs">
                      {post.description}
                    </span>
                  )}
                </MotionLink>
              );
            })}
        </AnimatePresence>
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
