"use client";

import { useEffect, useState, type CSSProperties } from "react";

type HeaderProps = {
  background: string;
  foreground: string;
};

// The sheets are 2100px tall = 6 vertical frames stacked on top of each other.
const FRAME_COUNT = 6;
const CYCLE_DURATION = "3s";
// Cap the rendered header height on very large screens (px).
const MAX_HEIGHT = 180;

function useFrameAspect(src: string) {
  // Aspect ratio (width / height) of a single frame, plus the native frame width.
  const [aspect, setAspect] = useState<number | null>(null);
  const [nativeWidth, setNativeWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const frameHeight = img.naturalHeight / FRAME_COUNT;
      setAspect(img.naturalWidth / frameHeight);
      setNativeWidth(img.naturalWidth);
    };
    img.src = src;
  }, [src]);

  return { aspect, nativeWidth };
}

/**
 * Sprite-sheet header. Each source PNG is a vertical strip of 6 frames.
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
  const fg = useFrameAspect(foreground);
  const bg = useFrameAspect(background);

  // Cap the foreground width so its aspect-driven height never exceeds
  // MAX_HEIGHT, and never upscale past the source resolution.
  const maxWidth =
    fg.aspect != null && fg.nativeWidth != null
      ? Math.min(fg.nativeWidth, MAX_HEIGHT * fg.aspect)
      : undefined;

  const ready = fg.aspect != null;
  const spriteAnimation = `headerSprite ${CYCLE_DURATION} steps(${FRAME_COUNT}) infinite`;

  const spriteLayer: CSSProperties = {
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
    backgroundPositionY: "0%",
    animation: spriteAnimation,
  };

  return (
    // Outer clips at the available (padded) width and centers everything.
    <div className="w-full flex justify-center overflow-hidden">
      <header
        className="relative w-full"
        style={{
          maxWidth,
          aspectRatio: fg.aspect ?? undefined,
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
            aspectRatio: bg.aspect ?? undefined,
            backgroundImage: `url("${background}")`,
            backgroundSize: `100% ${FRAME_COUNT * 100}%`,
          }}
        />
        {/* Foreground: fills the header width, never cropped. */}
        <div
          aria-hidden
          style={{
            ...spriteLayer,
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${foreground}")`,
            backgroundSize: `100% ${FRAME_COUNT * 100}%`,
          }}
        />
        <span className="sr-only">Rachel Koh</span>
      </header>
    </div>
  );
}
