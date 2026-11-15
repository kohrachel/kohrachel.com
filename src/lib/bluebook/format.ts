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
