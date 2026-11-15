import { describe, expect, test } from "bun:test";
import { avToBv, bvToAv } from "./bilibili-id";

describe("Bilibili ids", () => {
  test("converts a known av number to its BV id", () => {
    expect(avToBv(BigInt(170001))).toBe("BV17x411w7KC");
    expect(bvToAv("BV17x411w7KC")).toBe(BigInt(170001));
  });

  test.each(["BV1Tyaf6FEcq", "BV1bZ9aBGEA2", "BV1GJ411x7h7"])(
    "round-trips %s",
    (bvid) => {
      expect(avToBv(bvToAv(bvid))).toBe(bvid);
    },
  );
});
