"use client";

import type { PublicPost } from "@/db/schema";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
  posts: PublicPost[];
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cardW, setCardW] = useState(CARD_W);
  // Stacking order: the most recently dragged card stays on top after release.
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounter = useRef(1);
  // Keyed by post id so a card keeps its layout if the list changes order.
  const [layouts, setLayouts] = useState<Record<string, CardLayout>>({});

  // Generate genuinely random positions on the client after mount. Random must
  // be deferred out of render so Next doesn't evaluate it during prerender
  // (see nextjs.org/docs/messages/blocking-prerender-random-client).
  //
  // Only posts without a layout get one. With cacheComponents, Next keeps this
  // page alive in an <Activity> while you're on a post and re-runs effects
  // when you come back; rolling only missing ids means returning leaves the
  // cards (and anything you dragged) where they were. A fresh load still
  // gets a fresh layout.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random layout must be deferred to the client per Next.js prerender rules
    setLayouts((prev) => {
      if (posts.every((p) => prev[p.id])) return prev;
      const next = { ...prev };
      posts.forEach((p, i) => {
        next[p.id] ??= {
          top: Math.random(),
          left: Math.random(),
          rotate: (Math.random() - 0.5) * 24,
          // Accent is assigned by index (wrapping around), not randomly.
          accent: ACCENTS[i % ACCENTS.length],
        };
      });
      return next;
    });
  }, [posts]);

  // Measure the section so we can place cards in pixels. A stretched grid
  // item's height isn't a definite containing block for `top: %`, which is
  // why percentage positioning collapsed every card to the top edge.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      // 0x0 means hidden (Next hides this page with display:none while
      // you're on a post). Keep the last real size: dropping to 0 would
      // unmount the cards and play their exit animation.
      if (!w || !h) return;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
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
              const layout = layouts[post.id];
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

function sameBounds(a: Bounds, b: Bounds) {
  return (
    a.minX === b.minX &&
    a.maxX === b.maxX &&
    a.minY === b.minY &&
    a.maxY === b.maxY
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// Where `v` sits within [min, max] as 0..1. A zero-size range (e.g. the
// section is hidden, or the card fills it) carries no information, so keep
// the previous fraction.
function fractionIn(v: number, min: number, max: number, fallback: number) {
  return max > min ? clamp((v - min) / (max - min), 0, 1) : fallback;
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
  post: PublicPost;
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
      if (!w || !h) return; // hidden; keep the last real size
      setCardSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bounds = useMemo(
    () => (cardSize ? cardBounds(size, cardSize, rotate) : null),
    [size, cardSize, rotate],
  );

  // Position lives only in these x/y transforms (the card sits at top:0,
  // left:0). Drag moves the same values, so there is one source of truth for
  // where a card is. They're driven imperatively, never via `animate`, so a
  // re-render can't yank a dragged card back. Start at the entry point:
  // bottom-centre of the section.
  const x = useMotionValue(size.w / 2 - cardW / 2);
  const y = useMotionValue(size.h);

  // What the card is doing, so a bounds change knows how to respond.
  const phase = useRef<"pending" | "entering" | "idle" | "dragging">("pending");
  // The bounds the card was last placed against...
  const placed = useRef<Bounds | null>(null);
  // ...and where it sits within them, as 0..1 per axis. Starts at the random
  // layout spot; re-derived from the card's actual x/y on every resize, so a
  // dragged card keeps its new spot.
  const frac = useRef({ fx: left, fy: top });
  // Lets a superseded entrance animation know it no longer owns `phase`.
  const entryGen = useRef(0);

  // When Next hides this page (<Activity>, while you're on a post), effects
  // are torn down; when it's shown again Motion replays the card's mount:
  // `initial` is re-applied and x/y snap back to the entry point. So on hide,
  // remember where the card is and mark it unplaced; on show, the placement
  // effect below then fans it back out to that remembered spot.
  useEffect(
    () => () => {
      const b = placed.current;
      if (b && phase.current !== "entering") {
        frac.current = {
          fx: fractionIn(x.get(), b.minX, b.maxX, frac.current.fx),
          fy: fractionIn(y.get(), b.minY, b.maxY, frac.current.fy),
        };
      }
      placed.current = null;
      phase.current = "pending";
    },
    [x, y],
  );

  // Place the card whenever its bounds change: first measurement (fan-out
  // entrance), section resize (window resize, reflow, breakpoint), or its own
  // size changing, or the page being shown again (see above). Nothing happens
  // if the bounds are unchanged.
  useEffect(() => {
    if (!bounds) return;
    const prev = placed.current;
    if (prev && sameBounds(prev, bounds)) return;
    placed.current = bounds;

    // Motion keeps the constraints from drag start until the drag/fling
    // finishes; onDragTransitionEnd reconciles against `placed` then.
    if (phase.current === "dragging") return;

    if (phase.current === "idle" && prev) {
      frac.current = {
        fx: fractionIn(x.get(), prev.minX, prev.maxX, frac.current.fx),
        fy: fractionIn(y.get(), prev.minY, prev.maxY, frac.current.fy),
      };
    }
    const tx = bounds.minX + frac.current.fx * (bounds.maxX - bounds.minX);
    const ty = bounds.minY + frac.current.fy * (bounds.maxY - bounds.minY);

    if (phase.current === "idle") {
      x.stop();
      y.stop();
      x.set(tx);
      y.set(ty);
      return;
    }

    // Pending or mid-entrance: (re)aim the fan-out at the (new) spot. Only the
    // first one gets the stagger delay.
    const transition = {
      ...ENTRY_SPRING,
      delay: phase.current === "pending" ? index * 0.07 : 0,
    };
    phase.current = "entering";
    const gen = ++entryGen.current;
    Promise.all([animate(x, tx, transition), animate(y, ty, transition)]).then(
      () => {
        if (entryGen.current === gen && phase.current === "entering") {
          phase.current = "idle";
        }
      },
    );
  }, [bounds, index, x, y]);

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
        phase.current = "dragging";
        onDragStart();
      }}
      // After the fling settles: if the section resized mid-drag, the card
      // settled against stale constraints, so pull it inside the latest ones.
      onDragTransitionEnd={() => {
        phase.current = "idle";
        const b = placed.current;
        if (!b) return;
        const cx = clamp(x.get(), b.minX, b.maxX);
        const cy = clamp(y.get(), b.minY, b.maxY);
        if (cx !== x.get()) animate(x, cx, ENTRY_SPRING);
        if (cy !== y.get()) animate(y, cy, ENTRY_SPRING);
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
