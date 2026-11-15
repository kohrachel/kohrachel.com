import { describe, expect, test } from "bun:test";
import { formatDate, formatDuration } from "./format";

describe("formatDate", () => {
  test("shows a date at its precision", () => {
    expect(formatDate("2023-03-04")).toBe("Mar 4, 2023");
    expect(formatDate("2023-03-01", "month")).toBe("Mar 2023");
    expect(formatDate("2023-01-01", "year")).toBe("2023");
  });

  test("uses the UTC date of a timestamp", () => {
    expect(formatDate("2009-10-25T23:57:33Z")).toBe("Oct 25, 2009");
  });
});

describe("formatDuration", () => {
  test("shows minutes and seconds, with hours when needed", () => {
    expect(formatDuration(214)).toBe("3:34");
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(3723)).toBe("1:02:03");
  });
});
