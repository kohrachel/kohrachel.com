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

// Known source dimensions (width x height). The foreground drives the layout;
// its height is a vertical strip of FRAME_COUNT frames, so one frame is
// SHEET_HEIGHT / FRAME_COUNT tall. Because these are constants we can reserve
// the exact box immediately (even during SSR) — no measuring, no layout shift.
const FRAME_WIDTH = 2000; // foreground sheet width
const SHEET_HEIGHT = 2100;
const FRAME_ASPECT = FRAME_WIDTH / (SHEET_HEIGHT / FRAME_COUNT);
// Cap width so the aspect-driven height never exceeds MAX_HEIGHT, and never
// upscale past the source resolution.
const MAX_WIDTH = Math.min(FRAME_WIDTH, MAX_HEIGHT * FRAME_ASPECT);

/**
 * Sprite-sheet header. Each source PNG is a vertical strip of 6 frames.
 *
 * The foreground fills the width fully (never cropped) and its frame aspect
 * ratio sets the header height. The background is painted behind it at the same
 * height, centered horizontally, and is allowed to be cropped if wider.
 *
 * A single frame is isolated with `background-size` (the full sheet is 6x the
 * header height) and stepped through with a `steps(6)` animation
 * (see joshwcomeau.com/animation/sprites).
 */
export default function Header({ background, foreground }: HeaderProps) {
  // Whether the sprite sheets have finished loading (drives the placeholder).
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
      });
    Promise.all([preload(foreground), preload(background)]).then(() => {
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [foreground, background]);

  const spriteAnimation = `headerSprite ${CYCLE_DURATION} steps(${FRAME_COUNT}) infinite`;

  const layerBase: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
    backgroundPositionY: "0%",
    animation: spriteAnimation,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.3s ease",
  };

  return (
    <header
      className="relative w-full mx-auto overflow-hidden"
      style={{ maxWidth: MAX_WIDTH, aspectRatio: FRAME_ASPECT }}
    >
      {/* Loading placeholder: occupies the exact header box until sheets load. */}
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 bg-stone-800 animate-pulse"
        />
      )}
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
