import type { DatePrecision } from "@/domain-types/bluebook/add";

const DATE_FORMATS: Record<DatePrecision, Intl.DateTimeFormatOptions> = {
  day: { year: "numeric", month: "short", day: "numeric" },
  month: { year: "numeric", month: "short" },
  year: { year: "numeric" },
};

/** `2023-03-04` → "Mar 4, 2023", "Mar 2023" or "2023", by precision. */
export function formatDate(isoDate: string, precision: DatePrecision = "day") {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { ...DATE_FORMATS[precision], timeZone: "UTC" },
  );
}

/** 214 → "3:34", 3723 → "1:02:03". */
export function formatDuration(totalSeconds: number) {
  const seconds = Math.round(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateParts(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

/** `2026-11-12` → "12 November 2026", "November 2026" or "2026". */
export function formatDateLong(isoDate: string, precision: DatePrecision) {
  const { year, month, day } = dateParts(isoDate);
  const name = MONTHS[month - 1];
  if (precision === "year") return String(year);
  if (precision === "month") return `${name} ${year}`;
  return `${day} ${name} ${year}`;
}

/** `2026-11-12` → "12 Nov 2026", "Nov 2026" or "2026". */
export function formatDateShort(isoDate: string, precision: DatePrecision) {
  const { year, month, day } = dateParts(isoDate);
  const name = MONTHS[month - 1].slice(0, 3);
  if (precision === "year") return String(year);
  if (precision === "month") return `${name} ${year}`;
  return `${day} ${name} ${year}`;
}

/** A camera's date imprint: `2026-03-12` → "'26 3 12", "'26 3" or "'26". */
export function formatPhotoStamp(isoDate: string, precision: DatePrecision) {
  const { year, month, day } = dateParts(isoDate);
  const parts = [`'${String(year).slice(-2)}`, month, day];
  return parts
    .slice(0, precision === "year" ? 1 : precision === "month" ? 2 : 3)
    .join(" ");
}

/** A `<time datetime>` value at the date's precision: "2026-03-12", "2026-03" or "2026". */
export function isoDateAt(isoDate: string, precision: DatePrecision) {
  return isoDate.slice(
    0,
    precision === "day" ? 10 : precision === "month" ? 7 : 4,
  );
}
