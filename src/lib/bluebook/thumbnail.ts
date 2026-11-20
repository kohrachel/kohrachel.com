const TALLEST = 9 / 16;
const WIDEST = 2;

export type Frame = {
  /** CSS `aspect-ratio`. */
  ratio: string;
  /** Width over height, after holding it between 9:16 and 2:1. */
  value: number;
  /** `top`: cropped from a taller picture; `fit`: size unknown, shown whole. */
  crop: "cover" | "top" | "fit";
};

/**
 * The frame for a picture of this size: its own ratio, held between 9:16
 * and 2:1. Unknown sizes get a 16:9 frame that shows the whole picture.
 */
export function thumbnailFrame(
  size: { width: number; height: number } | null,
): Frame {
  if (!size) return { ratio: "16 / 9", value: 16 / 9, crop: "fit" };
  const value = size.width / size.height;
  if (value < TALLEST) return { ratio: "9 / 16", value: TALLEST, crop: "top" };
  if (value > WIDEST) return { ratio: "2 / 1", value: WIDEST, crop: "cover" };
  return { ratio: `${size.width} / ${size.height}`, value, crop: "cover" };
}
