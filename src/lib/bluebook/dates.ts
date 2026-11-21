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
const FUTURE = "That's in the future.";

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
    return fail(FUTURE);
  }
  return { ok: true, value };
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** 1–12 for a month's name or its first three or more letters ("sept"). */
function monthNumber(word: string) {
  if (word.length < 3) return null;
  const index = MONTHS.findIndex((name) => name.startsWith(word));
  return index < 0 ? null : index + 1;
}

const HOW_TO = "Try 2026, May 2026 or 20 May 2026.";

/**
 * A date as typed, at the precision typed: "2026" is that year, "May 2026"
 * that month, and "20 May 2026", "May 20, 2026", "2026-05-20" or
 * "2026年5月20日" that day. A month without a year is its latest one up to
 * `today` (`YYYY-MM-DD`), and "today" and "yesterday" work too.
 */
export function readTypedDate(
  text: string,
  today: string,
): ReturnType<typeof readDateParts> {
  const fail = (error: string) => ({ ok: false as const, error });
  const words = text
    .toLowerCase()
    .replace(/(\d{1,2})月/g, (_, n) => ` ${MONTHS[Number(n) - 1] ?? n} `)
    .replace(/年/g, " ")
    .replace(/[日号號]/g, "")
    .replace(/(\d)(st|nd|rd|th)\b/g, "$1")
    .split(/[\s,./-]+/)
    .filter(Boolean);
  if (!words.length) return fail(HOW_TO);

  const [ty, tm, td] = today.split("-").map(Number);
  if (
    words.length === 1 &&
    (words[0] === "today" || words[0] === "yesterday")
  ) {
    const date = new Date(
      Date.UTC(ty, tm - 1, td - (words[0] === "today" ? 0 : 1)),
    );
    return {
      ok: true,
      value: {
        consumedOn: date.toISOString().slice(0, 10),
        consumedPrecision: "day",
      },
    };
  }

  const named = words.map(monthNumber);
  const years = words.filter((word) => /^\d{4}$/.test(word));
  const numbers = words.filter((word) => /^\d{1,2}$/.test(word));
  const unknown = words.find(
    (word, i) => !named[i] && !/^(\d{1,2}|\d{4})$/.test(word),
  );
  if (unknown) return fail(`Couldn't read “${unknown}”. ${HOW_TO}`);
  const months = named.filter((n) => n !== null);
  if (years.length > 1 || months.length > 1) return fail(HOW_TO);

  const parts = months.length
    ? numbers.length <= 1 && { month: String(months[0]), day: numbers[0] ?? "" }
    : orderNumbers(numbers, /^\d{4}$/.test(words[0]));
  if (!parts) return fail(HOW_TO);
  const { month, day } = parts;
  const year = years[0];

  if (year) return readDateParts({ year, month, day }, today);
  if (!months.length) return fail(`Add a year. ${HOW_TO}`);
  const thisYear = readDateParts({ year: String(ty), month, day }, today);
  return thisYear.ok || thisYear.error !== FUTURE
    ? thisYear
    : readDateParts({ year: String(ty - 1), month, day }, today);
}

/**
 * Month and day from the numbers beside a year: "2026 5 20" is year, month,
 * day; "20 5 2026" is day, month, year, unless only "5 20 2026" can be.
 */
function orderNumbers(numbers: string[], yearFirst: boolean) {
  const [a = "", b = ""] = numbers;
  if (numbers.length > 2) return null;
  if (!b || yearFirst || Number(b) > 12) return { month: a, day: b };
  return { month: b, day: a };
}
