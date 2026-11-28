import { describe, expect, test } from "bun:test";
import { estimateLines, placeInColumns, placeTape } from "./masonry";

describe("placeTape", () => {
  const heights = new Array(40).fill(0.8);
  const ids = heights.map((_, index) => 100 - index);
  const columns = placeInColumns(heights, 4);
  const tapes = placeTape(heights, columns, ids);
  const where = (index: number) => {
    const column = columns.findIndex((cards) => cards.includes(index));
    return { column, row: columns[column].indexOf(index) };
  };

  test("tapes at most one card in four, the same way every time", () => {
    expect(tapes.size).toBeGreaterThan(0);
    expect(tapes.size).toBeLessThanOrEqual(10);
    expect(placeTape(heights, columns, ids)).toEqual(tapes);
  });

  test("spreads tape over every column with no two taped cards touching", () => {
    const spots = [...tapes.keys()].map(where);
    expect(new Set(spots.map((spot) => spot.column)).size).toBe(4);
    for (const a of spots) {
      for (const b of spots) {
        if (a === b) continue;
        const columnsApart = Math.abs(a.column - b.column);
        const rowsApart = Math.abs(a.row - b.row);
        expect(columnsApart + rowsApart).toBeGreaterThan(1);
      }
    }
  });

  test("changes colour and lean from one tape to the next, top to bottom", () => {
    const inOrder = [...tapes.entries()]
      .sort(
        ([a], [b]) =>
          where(a).row - where(b).row || where(a).column - where(b).column,
      )
      .map(([, tape]) => tape);
    inOrder.slice(1).forEach((tape, nth) => {
      expect(tape.colour).not.toBe(inOrder[nth].colour);
      expect(tape.leansRight).not.toBe(inOrder[nth].leansRight);
    });
  });

  test("tapes nothing under four cards, or cards with no seed", () => {
    expect(
      placeTape([1, 1, 1], placeInColumns([1, 1, 1], 2), [1, 2, 3]).size,
    ).toBe(0);
    const unseeded = heights.map(() => undefined);
    expect(placeTape(heights, columns, unseeded).size).toBe(0);
  });
});

describe("placeInColumns", () => {
  test("fills the top row in order, then the shortest column", () => {
    expect(placeInColumns([2, 1, 1, 1, 1], 3)).toEqual([[0], [1, 3], [2, 4]]);
  });

  test("keeps every item when there are more columns than items", () => {
    expect(placeInColumns([1], 3)).toEqual([[0], [], []]);
  });
});

describe("estimateLines", () => {
  test("counts Chinese as wider and stays within the limits", () => {
    expect(estimateLines("abcd", 4, 3)).toBe(1);
    expect(estimateLines("猫猫猫", 4, 3)).toBe(2);
    expect(estimateLines("x".repeat(100), 10, 3)).toBe(3);
    expect(estimateLines("", 10, 3)).toBe(1);
  });
});
