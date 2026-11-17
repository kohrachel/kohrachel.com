import { describe, expect, test } from "bun:test";
import { pickSnippet, searchWords } from "./snippet";

describe("pickSnippet", () => {
  const texts = [
    "I watched this twice. The ending about Mars was great!",
    "我的猫很可爱。它每天都睡觉。",
  ];

  test("picks the sentence with the most matching words", () => {
    expect(pickSnippet(texts, ["mars", "ending"])).toBe(
      "The ending about Mars was great!",
    );
    expect(pickSnippet(texts, ["猫"])).toBe("我的猫很可爱。");
  });

  test("falls back to the first sentence, or nothing without text", () => {
    expect(pickSnippet(texts, ["火星"])).toBe("I watched this twice.");
    expect(pickSnippet(["", "  "], ["x"])).toBeNull();
  });

  test("cuts a long sentence around the match", () => {
    const long = `${"a".repeat(300)} needle ${"b".repeat(300)}`;
    const snippet = pickSnippet([long], ["needle"])!;
    expect(snippet).toContain("needle");
    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet.length).toBeLessThanOrEqual(202);
  });
});

describe("searchWords", () => {
  test("splits on spaces and keeps at most `max` words", () => {
    expect(searchWords("  cleo   mars 火星 ", 10)).toEqual([
      "cleo",
      "mars",
      "火星",
    ]);
    expect(searchWords("a b c", 2)).toEqual(["a", "b"]);
  });
});
