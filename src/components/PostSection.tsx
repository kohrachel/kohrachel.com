"use client";

import { Post } from "@/db/schema";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
// Minimum gap between a card's (possibly tilted) edges and the section edge.
const MARGIN = 20;

// Inertia after a fling: low power + short time constant = a quick, short
// glide rather than a long slide (same feel as tobiasfried.com).
const DRAG_TRANSITION = { timeConstant: 50, power: 0.1 };
// Spring for the fan-out entrance.
const ENTRY_SPRING = { type: "spring", stiffness: 120, damping: 16 } as const;
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
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  layout={layout}
                  size={size}
                  cardW={cardW}
                  zIndex={zOrder[post.id] ?? 1}
                  onDragStart={() => {
                    const z = ++zCounter.current;
                    setZOrder((prev) => ({ ...prev, [post.id]: z }));
                  }}
                />
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

type Size = { w: number; h: number };
type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

// The x/y range a card may rest in. The card's layout box sits at the
// section's top-left (top:0, left:0), so these are x/y transform values
// directly. A tilted card's corners stick out past its layout box, so each
// side is pushed in by that overhang on top of MARGIN; that keeps the corners
// of a card resting at its own tilt fully inside the section. (Hover/drag
// un-tilt the card and scale it 5%, which MARGIN comfortably absorbs.)
function cardBounds(section: Size, card: Size, rotateDeg: number): Bounds {
  const t = (Math.abs(rotateDeg) * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const minX = MARGIN + (card.w * cos + card.h * sin - card.w) / 2;
  const minY = MARGIN + (card.w * sin + card.h * cos - card.h) / 2;
  return {
    minX,
    minY,
    // A card too big for the section is pinned at the margin.
    maxX: Math.max(minX, section.w - card.w - minX),
    maxY: Math.max(minY, section.h - card.h - minY),
  };
}

// One draggable post card.
function PostCard({
  post,
  index,
  layout,
  size,
  cardW,
  zIndex,
  onDragStart,
}: {
  post: Post;
  index: number;
  layout: CardLayout;
  size: Size;
  cardW: number;
  zIndex: number;
  onDragStart: () => void;
}) {
  // Set once a drag actually starts, so releasing a drag doesn't also follow
  // the link. Reset on every new press.
  const didDrag = useRef(false);
  const { top, left, rotate, accent } = layout;

  // Measure the card's real size (its height depends on its text). offset*
  // ignores transforms, so tilt/scale don't skew it.
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [cardSize, setCardSize] = useState<Size | null>(null);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setCardSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bounds = cardSize ? cardBounds(size, cardSize, rotate) : null;
  const finalX = bounds ? bounds.minX + left * (bounds.maxX - bounds.minX) : 0;
  const finalY = bounds ? bounds.minY + top * (bounds.maxY - bounds.minY) : 0;

  // Position lives only in these x/y transforms (the card sits at top:0,
  // left:0). Drag moves the same values, so there is one source of truth for
  // where a card is. They're driven imperatively, never via `animate`, so a
  // re-render can't yank a dragged card back. Start at the entry point:
  // bottom-centre of the section.
  const x = useMotionValue(size.w / 2 - cardW / 2);
  const y = useMotionValue(size.h);

  // Fan out to the card's spot once it has been measured. Runs once per
  // mount (the ref also guards against Strict Mode's double effect run).
  const entered = useRef(false);
  const hasBounds = bounds !== null;
  useEffect(() => {
    if (!hasBounds || entered.current) return;
    entered.current = true;
    const transition = { ...ENTRY_SPRING, delay: index * 0.07 };
    animate(x, finalX, transition);
    animate(y, finalY, transition);
  }, [hasBounds, finalX, finalY, index, x, y]);

  return (
    <MotionLink
      ref={cardRef}
      href={`/${post.id}`}
      className="group absolute top-0 left-0 flex flex-col gap-3 rounded-md border-2 border-black bg-background p-5 text-start text-primary no-underline shadow-sm focus-visible:outline-none"
      style={{ width: cardW, x, y }}
      // Stop the browser's native link drag from hijacking ours.
      draggable={false}
      drag
      dragConstraints={
        bounds
          ? {
              left: bounds.minX,
              right: bounds.maxX,
              top: bounds.minY,
              bottom: bounds.maxY,
            }
          : false
      }
      dragElastic={0.2}
      dragTransition={DRAG_TRANSITION}
      onPointerDown={() => {
        didDrag.current = false;
      }}
      onDragStart={() => {
        didDrag.current = true;
        onDragStart();
      }}
      onClick={(e) => {
        if (didDrag.current) e.preventDefault();
      }}
      initial={{
        rotate: 0,
        scale: 0.6,
        opacity: 0,
        backgroundColor: "var(--background)",
        color: "var(--primary)",
      }}
      animate={{
        rotate,
        scale: 1,
        opacity: 1,
        backgroundColor: "var(--background)",
        color: "var(--primary)",
        zIndex,
        transition: {
          ...ENTRY_SPRING,
          delay: index * 0.07,
          // Restack instantly, without the entrance delay.
          zIndex: { duration: 0 },
        },
      }}
      exit={{
        x: size.w / 2 - cardW / 2,
        y: size.h,
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
}
