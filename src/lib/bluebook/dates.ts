import type { DatePrecision } from "@/domain-types/bluebook/add";

/** An ISO timestamp as a date input's value (`YYYY-MM-DD`, UTC), or `""`. */
export function dateInputValue(iso: string | null) {
  return iso?.slice(0, 10) ?? "";
}

/**
 * The publish date to save from a date input. Left as it was, the original
 * timestamp keeps its time; a date typed in is saved at midnight UTC.
 */
export function publishedAtFromInput(original: string | null, value: string) {
  if (value === dateInputValue(original)) return original;
  return value ? `${value}T00:00:00Z` : null;
}

/**
 * Approximate dates are stored as the start of their period, so "March 2026"
 * is always 2026-03-01 and sorts consistently.
 */
export function startOfPeriod(date: string, precision: DatePrecision) {
  const [year, month] = date.split("-");
  switch (precision) {
    case "day":
      return date;
    case "month":
      return `${year}-${month}-01`;
    case "year":
      return `${year}-01-01`;
  }
}

/** What's typed in the year, month and day boxes. */
export type DateParts = { year: string; month: string; day: string };

export type ConsumedDate = {
  consumedOn: string;
  consumedPrecision: DatePrecision;
};

/** The boxes for a stored date: only the parts its precision has. */
export function dateParts(date: string, precision: DatePrecision): DateParts {
  const [year, month, day] = date.split("-");
  return {
    year,
    month: precision === "year" ? "" : month,
    day: precision === "day" ? day : "",
  };
}

const EARLIEST_YEAR = 1900;

/**
 * The date and precision the boxes describe: a year alone is that year,
 * with a month that month, with a day that day. `today` (`YYYY-MM-DD`)
 * rules out future dates.
 */
export function readDateParts(
  { year, month, day }: DateParts,
  today: string,
): { ok: true; value: ConsumedDate } | { ok: false; error: string } {
  const fail = (error: string) => ({ ok: false as const, error });
  const [y, m, d] = [year, month, day].map((part) => part.trim());

  if (!y) return fail("Add a year.");
  if (!/^\d{4}$/.test(y)) return fail("Use a 4-digit year.");
  if (Number(y) < EARLIEST_YEAR)
    return fail(`Use a year from ${EARLIEST_YEAR} on.`);
  if (m && !(/^\d{1,2}$/.test(m) && Number(m) >= 1 && Number(m) <= 12)) {
    return fail("Months go from 1 to 12.");
  }
  if (d && !m) return fail("Add a month for that day.");
  const daysInMonth = m
    ? new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate()
    : 0;
  if (
    d &&
    !(/^\d{1,2}$/.test(d) && Number(d) >= 1 && Number(d) <= daysInMonth)
  ) {
    return fail(`That month has ${daysInMonth} days.`);
  }

  const pad = (part: string) => part.padStart(2, "0");
  const value: ConsumedDate = d
    ? { consumedOn: `${y}-${pad(m)}-${pad(d)}`, consumedPrecision: "day" }
    : m
      ? { consumedOn: `${y}-${pad(m)}-01`, consumedPrecision: "month" }
      : { consumedOn: `${y}-01-01`, consumedPrecision: "year" };

  // Compared at the same precision, so "this month" isn't in the future.
  const length = { day: 10, month: 7, year: 4 }[value.consumedPrecision];
  if (value.consumedOn.slice(0, length) > today.slice(0, length)) {
    return fail("That's in the future.");
  }
  return { ok: true, value };
}
