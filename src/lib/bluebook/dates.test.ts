import { describe, expect, test } from "bun:test";
import { dateInputValue, publishedAtFromInput } from "./dates";

describe("publishedAtFromInput", () => {
  const original = "2009-10-25T06:57:33.000Z";

  test("keeps the original timestamp when the date is unchanged", () => {
    expect(publishedAtFromInput(original, dateInputValue(original))).toBe(
      original,
    );
  });

  test("saves a changed date at midnight UTC, and an empty one as none", () => {
    expect(publishedAtFromInput(original, "2010-01-02")).toBe(
      "2010-01-02T00:00:00Z",
    );
    expect(publishedAtFromInput(null, "2010-01-02")).toBe(
      "2010-01-02T00:00:00Z",
    );
    expect(publishedAtFromInput(original, "")).toBeNull();
    expect(publishedAtFromInput(null, "")).toBeNull();
  });
});
