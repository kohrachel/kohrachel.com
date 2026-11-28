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

export type Tape = { colour: number; leansRight: boolean };

// In column widths. Columns count as further apart than they are, so tape
// spreads across the grid before it stacks down a column.
const ROW_GAP = 0.1;
const COLUMN_STEP = 1.6;

/**
 * Which cards in one placement get washi tape: at most one in four, each
 * kept clear of the others so tape spreads evenly over the grid. Cards are
 * tried in an order scrambled from `seeds` (item ids), so mostly the same
 * items keep their tape as the grid changes; cards with no seed never get
 * any. Colour and lean alternate in reading order. `heights` and `columns`
 * are as for `placeInColumns`; returns tape by card index.
 */
export function placeTape(
  heights: number[],
  columns: number[][],
  seeds: (number | undefined)[],
) {
  const most = Math.floor(heights.length / 4);
  const tapes = new Map<number, Tape>();
  if (most === 0) return tapes;

  const centres = new Map<number, { x: number; y: number }>();
  const columnHeights = columns.map((column, c) =>
    column.reduce((top, index) => {
      centres.set(index, { x: c * COLUMN_STEP, y: top + heights[index] / 2 });
      return top + heights[index] + ROW_GAP;
    }, 0),
  );
  const area = columns.length * COLUMN_STEP * Math.max(...columnHeights);
  const spacing = 1.1 * Math.sqrt(area / most);
  const apart = (a: number, b: number) =>
    Math.hypot(
      centres.get(a)!.x - centres.get(b)!.x,
      centres.get(a)!.y - centres.get(b)!.y,
    );

  const order = [...centres.keys()]
    .filter((index) => seeds[index] !== undefined)
    .sort((a, b) => scramble(seeds[a]!) - scramble(seeds[b]!));
  const taped: number[] = [];
  // A second, closer pass fills in when the first leaves too few.
  for (const reach of [spacing, 0.7 * spacing]) {
    for (const index of order) {
      if (
        taped.length < most &&
        !taped.includes(index) &&
        taped.every((other) => apart(index, other) >= reach)
      ) {
        taped.push(index);
      }
    }
  }

  taped
    .sort(
      (a, b) =>
        centres.get(a)!.y - centres.get(b)!.y ||
        centres.get(a)!.x - centres.get(b)!.x,
    )
    .forEach((index, nth) =>
      tapes.set(index, { colour: nth % 3, leansRight: nth % 2 === 1 }),
    );
  return tapes;
}

/** Spreads neighbouring ids far apart, the same way every time. */
function scramble(id: number) {
  const mixed = Math.imul(id ^ 0x5bd1e995, 0x9e3779b1);
  const once = Math.imul(mixed ^ (mixed >>> 15), 0x85ebca6b);
  return (once ^ (once >>> 13)) >>> 0;
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
