import { describe, expect, test } from "bun:test";
import {
  formatDate,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatPhotoStamp,
  timesInWords,
} from "./format";

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

describe("date stamps", () => {
  test("write a date out at its precision", () => {
    expect(formatDateLong("2026-11-02", "day")).toBe("2 November 2026");
    expect(formatDateLong("2026-09-01", "month")).toBe("September 2026");
    expect(formatDateShort("2026-09-12", "day")).toBe("12 Sep 2026");
    expect(formatDateShort("2026-01-01", "year")).toBe("2026");
  });

  test("print a camera imprint without leading zeros", () => {
    expect(formatPhotoStamp("2026-03-02", "day")).toBe("'26 3 2");
    expect(formatPhotoStamp("2026-11-01", "month")).toBe("'26 11");
    expect(formatPhotoStamp("2009-01-01", "year")).toBe("'09");
  });
});

describe("timesInWords", () => {
  test("says once and twice in words", () => {
    expect(timesInWords(1)).toBe("once");
    expect(timesInWords(2)).toBe("twice");
    expect(timesInWords(3)).toBe("3 times");
  });
});
