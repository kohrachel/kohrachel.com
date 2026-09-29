"use client";

import { Post } from "@/db/schema";
import Link from "next/link";
import { useMemo } from "react";

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

// Deterministic pseudo-random from a seed so card positions stay stable
// across re-renders (no hydration mismatch, no jumping on hover).
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

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
  const layouts = useMemo<CardLayout[]>(() => {
    return posts.map((post, i) => {
      const rand = seeded(post.id * 97 + i * 13 + 7);
      return {
        // Percentages keep cards inside the container across screen sizes.
        top: Math.floor(rand() * 55),
        left: Math.floor(rand() * 65),
        rotate: (rand() - 0.5) * 24,
        accent: ACCENTS[Math.floor(rand() * ACCENTS.length)],
      };
    });
  }, [posts]);

  return (
    <section
      className={`relative h-[70dvh] min-h-100 max-h-160 overflow-hidden rounded-lg border-4 border-black/70 bg-[oklch(0.6937_0.0534_132.56)] ${className}`}
      data-not-typeset
    >
      {posts.length ? (
        posts.map((post, i) => {
          const { top, left, rotate, accent } = layouts[i];
          return (
            <Link
              key={post.id}
              href={`/${post.id}`}
              style={
                {
                  top: `${top}%`,
                  left: `${left}%`,
                  "--rotate": `${rotate}deg`,
                  "--accent": accent,
                } as React.CSSProperties
              }
              className="group absolute z-[1] flex h-64 w-64 max-sm:h-40 max-sm:w-40 flex-col gap-3 rounded-md border-2 border-black bg-white p-5 text-start text-black no-underline shadow-sm transition-[transform,background-color,z-index] duration-100 [transform:rotate(var(--rotate))] hover:z-50 hover:bg-[var(--accent)] hover:[transform:rotate(0deg)_scale(1.04)] focus-visible:z-50 focus-visible:[transform:rotate(0deg)_scale(1.04)] focus-visible:outline-none"
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
    </section>
  );
}
