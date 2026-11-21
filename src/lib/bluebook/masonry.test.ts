import { describe, expect, test } from "bun:test";
import { estimateLines, placeInColumns } from "./masonry";

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
