import { describe, expect, test } from "bun:test";
import {
  dateInputValue,
  dateParts,
  publishedAtFromInput,
  readDateParts,
  readTypedDate,
} from "./dates";

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

describe("readDateParts", () => {
  const today = "2026-11-15";
  const read = (year: string, month = "", day = "") =>
    readDateParts({ year, month, day }, today);

  test("takes its precision from the parts filled in", () => {
    expect(read("2025")).toEqual({
      ok: true,
      value: { consumedOn: "2025-01-01", consumedPrecision: "year" },
    });
    expect(read("2025", "3")).toEqual({
      ok: true,
      value: { consumedOn: "2025-03-01", consumedPrecision: "month" },
    });
    expect(read("2025", "03", "7")).toEqual({
      ok: true,
      value: { consumedOn: "2025-03-07", consumedPrecision: "day" },
    });
  });

  test("allows today, this month and this year, not later", () => {
    expect(read("2026", "11", "15").ok).toBe(true);
    expect(read("2026", "11").ok).toBe(true);
    expect(read("2026").ok).toBe(true);
    expect(read("2026", "11", "16")).toEqual({
      ok: false,
      error: "That's in the future.",
    });
    expect(read("2026", "12")).toEqual({
      ok: false,
      error: "That's in the future.",
    });
    expect(read("2027")).toEqual({ ok: false, error: "That's in the future." });
  });

  test("explains what's wrong", () => {
    expect(read("")).toEqual({ ok: false, error: "Add a year." });
    expect(read("20")).toEqual({ ok: false, error: "Use a 4-digit year." });
    expect(read("1850")).toEqual({
      ok: false,
      error: "Use a year from 1900 on.",
    });
    expect(read("2025", "13")).toEqual({
      ok: false,
      error: "Months go from 1 to 12.",
    });
    expect(read("2025", "", "5")).toEqual({
      ok: false,
      error: "Add a month for that day.",
    });
    expect(read("2025", "2", "29")).toEqual({
      ok: false,
      error: "That month has 28 days.",
    });
    expect(read("2024", "2", "29").ok).toBe(true);
  });
});

describe("dateParts", () => {
  test("shows only the parts a date's precision has", () => {
    expect(dateParts("2025-01-01", "year")).toEqual({
      year: "2025",
      month: "",
      day: "",
    });
    expect(dateParts("2025-03-01", "month")).toEqual({
      year: "2025",
      month: "03",
      day: "",
    });
    expect(dateParts("2025-03-07", "day")).toEqual({
      year: "2025",
      month: "03",
      day: "07",
    });
  });
});

describe("readTypedDate", () => {
  const today = "2026-11-20";
  const read = (text: string) => {
    const result = readTypedDate(text, today);
    return result.ok
      ? `${result.value.consumedOn} ${result.value.consumedPrecision}`
      : result.error;
  };

  test("reads the precision from what's typed", () => {
    expect(read("2026")).toBe("2026-01-01 year");
    expect(read("May 2026")).toBe("2026-05-01 month");
    expect(read("2026 may")).toBe("2026-05-01 month");
    expect(read("20 May 2026")).toBe("2026-05-20 day");
    expect(read("2026 may 20")).toBe("2026-05-20 day");
    expect(read("May 20th, 2026")).toBe("2026-05-20 day");
    expect(read("sept 3 2025")).toBe("2025-09-03 day");
  });

  test("reads numbers year first or year last", () => {
    expect(read("2026-05-20")).toBe("2026-05-20 day");
    expect(read("2026/5")).toBe("2026-05-01 month");
    expect(read("5/2026")).toBe("2026-05-01 month");
    expect(read("20/5/2026")).toBe("2026-05-20 day");
    expect(read("5/20/2026")).toBe("2026-05-20 day");
    expect(read("2026年5月20日")).toBe("2026-05-20 day");
    expect(read("2026年5月")).toBe("2026-05-01 month");
  });

  test("takes a month without a year as its latest one", () => {
    expect(read("may")).toBe("2026-05-01 month");
    expect(read("may 20")).toBe("2026-05-20 day");
    expect(read("december")).toBe("2025-12-01 month");
    expect(read("5月20日")).toBe("2026-05-20 day");
  });

  test("knows today and yesterday", () => {
    expect(read("today")).toBe("2026-11-20 day");
    expect(read("Yesterday")).toBe("2026-11-19 day");
    expect(readTypedDate("yesterday", "2026-01-01")).toEqual({
      ok: true,
      value: { consumedOn: "2025-12-31", consumedPrecision: "day" },
    });
  });

  test("says what's wrong", () => {
    expect(read("")).toContain("Try 2026");
    expect(read("202")).toContain("Couldn't read “202”");
    expect(read("soon")).toContain("Couldn't read “soon”");
    expect(read("20")).toBe("Add a year. Try 2026, May 2026 or 20 May 2026.");
    expect(read("31 feb 2026")).toBe("That month has 28 days.");
    expect(read("2027")).toBe("That's in the future.");
    expect(read("1 2 3 2026")).toContain("Try 2026");
  });
});
