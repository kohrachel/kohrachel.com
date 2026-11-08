"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type SpriteSources = {
  /** Full-size AVIF sheet. */
  avif: string;
  /** Half-size AVIF sheet for narrow screens. */
  avifSmall: string;
  /** Original PNG, for browsers without AVIF. */
  fallback: string;
};

type HeaderProps = {
  background: SpriteSources;
  foreground: SpriteSources;
};

// Each sheet is 6 frames stacked vertically.
const FRAME_COUNT = 6;
const CYCLE_DURATION = "3s";
// Cap the rendered header height on very large screens (px).
const MAX_HEIGHT = 180;
// Size of the full-size sheets, hardcoded so the header's space is reserved
// before any image loads (no layout shift). The small sheets are exactly half
// size, so the aspect ratios are identical.
const FOREGROUND = { width: 2000, frameHeight: 350 };
const BACKGROUND = { width: 3150, frameHeight: 350 };
const FG_ASPECT = FOREGROUND.width / FOREGROUND.frameHeight;
const BG_ASPECT = BACKGROUND.width / BACKGROUND.frameHeight;
// Never upscale the foreground past its source width, and keep its height
// within MAX_HEIGHT.
const MAX_WIDTH = Math.min(FOREGROUND.width, MAX_HEIGHT * FG_ASPECT);
// Screens this narrow get the half-size sheets.
const SMALL_MEDIA = "(max-width: 767px)";

/**
 * Lets the browser pick the right file (AVIF or PNG, full or half size) via a
 * hidden <picture>, then reports the URL it actually loaded. The sprite layer
 * uses that same URL, so it's a cache hit, never a second download.
 */
function useLoadedSrc() {
  const ref = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const onLoad = () => {
      if (img.naturalWidth > 0) setSrc(img.currentSrc || img.src);
    };
    // The image may have finished loading before hydration.
    if (img.complete) onLoad();
    else img.addEventListener("load", onLoad, { once: true });
    return () => img.removeEventListener("load", onLoad);
  }, []);

  return { ref, src };
}

function SpritePicture({
  sources,
  imgRef,
}: {
  sources: SpriteSources;
  imgRef: React.Ref<HTMLImageElement>;
}) {
  return (
    <picture>
      <source
        type="image/avif"
        media={SMALL_MEDIA}
        srcSet={sources.avifSmall}
      />
      <source type="image/avif" srcSet={sources.avif} />
      {/* Hidden images still download; high priority because the header is
          the first thing on the page. */}
      <img
        ref={imgRef}
        src={sources.fallback}
        alt=""
        hidden
        fetchPriority="high"
      />
    </picture>
  );
}

/**
 * Sprite-sheet header. Each source image is a vertical strip of 6 frames.
 *
 * The foreground drives the height: it always fits within the available width
 * (screen minus page padding) and its frame aspect ratio sets the header
 * height, so it never gets cropped and shrinks with the viewport.
 *
 * The background is intentionally wider than the foreground. It's centered on
 * screen at the same height and shown in full — it overflows the foreground and
 * is only clipped at the available width (i.e. if the screen is too narrow to
 * fit it). On very wide screens the background simply doesn't reach the edges.
 *
 * A single frame is isolated with `background-size: <w> 600%` (the full sheet
 * is 6x the header height) and stepped through with a `steps(6)` animation
 * (see joshwcomeau.com/animation/sprites).
 */
export default function Header({ background, foreground }: HeaderProps) {
  const fg = useLoadedSrc();
  const bg = useLoadedSrc();

  // As before, the header stays invisible until the foreground has loaded.
  const ready = fg.src != null;
  const spriteAnimation = `headerSprite ${CYCLE_DURATION} steps(${FRAME_COUNT}) infinite`;

  const spriteLayer: CSSProperties = {
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
    backgroundPositionY: "0%",
    backgroundSize: `100% ${FRAME_COUNT * 100}%`,
    animation: spriteAnimation,
  };

  return (
    // Outer clips at the available (padded) width and centers everything.
    <div className="w-full flex justify-center overflow-hidden">
      <SpritePicture sources={foreground} imgRef={fg.ref} />
      <SpritePicture sources={background} imgRef={bg.ref} />
      <header
        className="relative w-full"
        style={{
          maxWidth: MAX_WIDTH,
          aspectRatio: FG_ASPECT,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {/* Background: wider than the header, centered on screen, shown in full. */}
        <div
          aria-hidden
          style={{
            ...spriteLayer,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            aspectRatio: BG_ASPECT,
            backgroundImage: bg.src ? `url("${bg.src}")` : undefined,
          }}
        />
        {/* Foreground: fills the header width, never cropped. */}
        <div
          aria-hidden
          style={{
            ...spriteLayer,
            position: "absolute",
            inset: 0,
            backgroundImage: fg.src ? `url("${fg.src}")` : undefined,
          }}
        />
        <span className="sr-only">Rachel Koh</span>
      </header>
    </div>
  );
}
