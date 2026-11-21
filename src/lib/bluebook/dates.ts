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
