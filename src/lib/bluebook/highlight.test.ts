import { describe, expect, test } from "bun:test";
import { highlightParts } from "./highlight";

describe("highlightParts", () => {
  test("marks every match, in any case", () => {
    expect(highlightParts("Grain by grain", ["grain"])).toEqual([
      { text: "Grain", hit: true },
      { text: " by ", hit: false },
      { text: "grain", hit: true },
    ]);
  });

  test("marks Chinese and treats words as plain text", () => {
    expect(highlightParts("京都的老茶铺", ["茶铺"])).toEqual([
      { text: "京都的老", hit: false },
      { text: "茶铺", hit: true },
    ]);
    expect(highlightParts("a+b", ["a+"])).toEqual([
      { text: "a+", hit: true },
      { text: "b", hit: false },
    ]);
  });

  test("leaves text alone without words", () => {
    expect(highlightParts("mars", [])).toEqual([{ text: "mars", hit: false }]);
  });
});
