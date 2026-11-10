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

// Card widths (px). These are the single source of truth: they're applied to
// the card via `style.width` AND used for layout math, so the two can't drift.
const CARD_W = 240;
const CARD_W_SM = 176;
// Same query as Tailwind v4's `max-sm:` variant (default sm = 40rem), so the
// width switches in lockstep with the `max-sm:` text sizes on the card.
const SM_QUERY = "(width < 40rem)";
// Card height still varies with its text; this is a generous estimate used
// only to keep cards inside the section bounds.
const CARD_H = 220;
const MARGIN = 20;

// Inertia after a fling: low power + short time constant = a quick, short
// glide rather than a long slide (same feel as tobiasfried.com).
const DRAG_TRANSITION = { timeConstant: 50, power: 0.1 };
// zIndex while hovered/dragged; above any stacking order a card can earn.
const Z_ACTIVE = 1000;

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
  const [cardW, setCardW] = useState(CARD_W);
  // Stacking order: the most recently dragged card stays on top after release.
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounter = useRef(1);
  // Set once a drag actually starts, so releasing a drag doesn't also follow
  // the link. Reset on every new press.
  const didDrag = useRef(false);
  const [layouts, setLayouts] = useState<CardLayout[]>([]);

  // Generate genuinely random positions on the client after mount. Random must
  // be deferred out of render so Next doesn't evaluate it during prerender
  // (see nextjs.org/docs/messages/blocking-prerender-random-client); this also
  // re-rolls the layout on every visit.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random layout must be deferred to the client per Next.js prerender rules
    setLayouts(
      posts.map((_, i) => ({
        top: Math.random(),
        left: Math.random(),
        rotate: (Math.random() - 0.5) * 24,
        // Accent is assigned by index (wrapping around), not randomly.
        accent: ACCENTS[i % ACCENTS.length],
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

  // Track which card width applies. Cards only render once the section has
  // been measured (after mount), so they never render with a stale width.
  useEffect(() => {
    const mq = window.matchMedia(SM_QUERY);
    const update = () => setCardW(mq.matches ? CARD_W_SM : CARD_W);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const availW = Math.max(0, size.w - cardW - MARGIN * 2);
  const availH = Math.max(0, size.h - CARD_H - MARGIN * 2);

  return (
    <section
      ref={ref}
      className={`relative min-h-100 self-stretch overflow-hidden rounded-lg border-4 border-black/70 bg-[url('/flowers-blur.jpg')] bg-cover bg-center ${className}`}
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
                  className="group absolute flex flex-col gap-3 rounded-md border-2 border-black bg-background p-5 text-start text-primary no-underline shadow-sm focus-visible:outline-none"
                  style={{ width: cardW }}
                  // Stop the browser's native link drag from hijacking ours.
                  draggable={false}
                  drag
                  dragConstraints={ref}
                  dragElastic={0.2}
                  dragTransition={DRAG_TRANSITION}
                  onPointerDown={() => {
                    didDrag.current = false;
                  }}
                  onDragStart={() => {
                    didDrag.current = true;
                    const z = ++zCounter.current;
                    setZOrder((prev) => ({ ...prev, [post.id]: z }));
                  }}
                  onClick={(e) => {
                    if (didDrag.current) e.preventDefault();
                  }}
                  // Fan out from the bottom-center of the section.
                  initial={{
                    top: size.h,
                    left: size.w / 2 - cardW / 2,
                    rotate: 0,
                    scale: 0.6,
                    opacity: 0,
                    backgroundColor: "var(--background)",
                    color: "var(--primary)",
                  }}
                  animate={{
                    top: finalTop,
                    left: finalLeft,
                    rotate,
                    scale: 1,
                    opacity: 1,
                    backgroundColor: "var(--background)",
                    color: "var(--primary)",
                    zIndex: zOrder[post.id] ?? 1,
                    transition: {
                      type: "spring",
                      stiffness: 120,
                      damping: 16,
                      delay: i * 0.07,
                      // Restack instantly, without the entrance delay.
                      zIndex: { duration: 0 },
                    },
                  }}
                  exit={{
                    top: size.h,
                    left: size.w / 2 - cardW / 2,
                    rotate: 0,
                    scale: 0.6,
                    opacity: 0,
                    transition: { duration: 0.25 },
                  }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.05,
                    zIndex: Z_ACTIVE,
                    backgroundColor: accent,
                    color: "#000000",
                    transition: { duration: 0.15 },
                  }}
                  whileTap={{ scale: 0.97, zIndex: Z_ACTIVE }}
                  whileDrag={{
                    rotate: 0,
                    scale: 1.05,
                    zIndex: Z_ACTIVE,
                    cursor: "grabbing",
                    backgroundColor: accent,
                    color: "#000000",
                  }}
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
      <span className="absolute bottom-2 right-3 z-1001 text-xs italic text-white/70">
        this section credits:{" "}
        <Link
          href="https://tobiasfried.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 no-underline hover:text-primary hover:underline"
        >
          tobias fried
        </Link>
      </span>
    </section>
  );
}
