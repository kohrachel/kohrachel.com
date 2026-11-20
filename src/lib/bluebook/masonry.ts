/** Column counts the homepage grid can have, from phones up to its widest. */
export const MASONRY_COLUMNS = [2, 3, 4] as const;

/**
 * Splits items, in order, into `columns` columns: each goes into the column
 * that's shortest so far, so the first items read across the top row.
 * `heights` are in any one unit; returns each column's item indexes.
 */
export function placeInColumns(heights: number[], columns: number) {
  const placed: number[][] = Array.from({ length: columns }, () => []);
  const totals = new Array<number>(columns).fill(0);
  heights.forEach((height, index) => {
    const shortest = totals.indexOf(Math.min(...totals));
    placed[shortest].push(index);
    totals[shortest] += height;
  });
  return placed;
}

/** Roughly how many lines `text` takes at `perLine` Latin letters a line. */
export function estimateLines(text: string, perLine: number, max: number) {
  // CJK characters are about twice as wide as Latin letters.
  const width = [...text].reduce(
    (sum, char) => sum + (/[⺀-￿]/.test(char) ? 2 : 1),
    0,
  );
  return Math.min(max, Math.max(1, Math.ceil(width / perLine)));
}
