import { describe, expect, test } from "bun:test";
import {
  dateInputValue,
  dateParts,
  publishedAtFromInput,
  readDateParts,
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
