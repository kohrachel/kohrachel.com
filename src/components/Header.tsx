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
const MAX_HEIGHT = 224;

/**
 * Sprite-sheet header. Each source PNG is a vertical strip of 6 frames.
 *
 * The foreground drives the layout: it always fits within the available width
 * (screen minus page padding) and its frame aspect ratio sets the header
 * height, so it never gets cropped and shrinks with the viewport. The
 * background is painted behind it at the same height, centered horizontally,
 * and is allowed to be cropped if its frame is wider than the header.
 *
 * A single frame is isolated with `background-size: <w> 600%` (the full sheet
 * is 6x the header height) and the frame index is stepped through with a
 * `steps(6)` animation (see joshwcomeau.com/animation/sprites).
 */
export default function Header({ background, foreground }: HeaderProps) {
  // Aspect ratio (width / height) of a single foreground frame.
  const [frameAspect, setFrameAspect] = useState<number | null>(null);
  // Native frame width, so we never upscale past the source resolution.
  const [nativeWidth, setNativeWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const frameHeight = img.naturalHeight / FRAME_COUNT;
      setFrameAspect(img.naturalWidth / frameHeight);
      setNativeWidth(img.naturalWidth);
    };
    img.src = foreground;
  }, [foreground]);

  // Cap width so the aspect-driven height never exceeds MAX_HEIGHT, and never
  // upscale past the source resolution.
  const maxWidth =
    frameAspect != null && nativeWidth != null
      ? Math.min(nativeWidth, MAX_HEIGHT * frameAspect)
      : undefined;

  const spriteAnimation = `headerSprite ${CYCLE_DURATION} steps(${FRAME_COUNT}) infinite`;

  const layerBase: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
    backgroundPositionY: "0%",
    animation: spriteAnimation,
  };

  return (
    <header
      className="relative w-full mx-auto overflow-hidden"
      style={{
        maxWidth,
        // Until we know the frame ratio, keep it invisible to avoid a flash.
        aspectRatio: frameAspect ?? undefined,
        visibility: frameAspect ? "visible" : "hidden",
      }}
    >
      {/* Background: matches header height, cropped horizontally if wider. */}
      <div
        aria-hidden
        style={{
          ...layerBase,
          backgroundImage: `url("${background}")`,
          backgroundSize: `auto ${FRAME_COUNT * 100}%`,
        }}
      />
      {/* Foreground: fills the width fully (never cropped). */}
      <div
        aria-hidden
        style={{
          ...layerBase,
          backgroundImage: `url("${foreground}")`,
          backgroundSize: `100% ${FRAME_COUNT * 100}%`,
        }}
      />
      <span className="sr-only">Rachel Koh</span>
    </header>
  );
}
