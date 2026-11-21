"use client";

import {
  DATE_PRECISIONS,
  type DatePrecision,
} from "@/domain-types/bluebook/add";
import { dateInputClass, inputClass } from "./styles";

const PRECISION_LABELS: Record<DatePrecision, string> = {
  day: "Day",
  month: "Month",
  year: "Year",
};

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  }),
);

/**
 * When you watched or read it. The date is always a full `YYYY-MM-DD`; with
 * month or year precision only that part is shown and changed.
 */
export function ConsumedField({
  date,
  precision,
  onDateChange,
  onPrecisionChange,
  label = "Watched or read",
}: {
  label?: string;
  date: string;
  precision: DatePrecision;
  onDateChange: (date: string) => void;
  onPrecisionChange: (precision: DatePrecision) => void;
}) {
  const [year, month] = date.split("-");
  const thisYear = Number(localToday().slice(0, 4));
  const years = Array.from({ length: thisYear - 1949 }, (_, i) =>
    String(thisYear - i),
  );

  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="mb-1 text-stone-500">{label}</legend>
      <div className="flex w-fit rounded-md border border-stone-300 p-0.5">
        {DATE_PRECISIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={precision === option}
            onClick={() => onPrecisionChange(option)}
            className="rounded px-3 py-1 aria-pressed:bg-stone-900 aria-pressed:text-white"
          >
            {PRECISION_LABELS[option]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {precision === "day" && (
          <input
            type="date"
            aria-label="Date"
            value={date}
            onChange={(event) =>
              event.target.value && onDateChange(event.target.value)
            }
            required
            className={dateInputClass}
          />
        )}
        {precision === "month" && (
          <select
            aria-label="Month"
            value={month}
            onChange={(event) =>
              onDateChange(`${year}-${event.target.value}-01`)
            }
            className={inputClass}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={String(i + 1).padStart(2, "0")}>
                {name}
              </option>
            ))}
          </select>
        )}
        {precision !== "day" && (
          <select
            aria-label="Year"
            value={year}
            onChange={(event) =>
              onDateChange(`${event.target.value}-${month}-01`)
            }
            className={inputClass}
          >
            {years.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}
      </div>
    </fieldset>
  );
}

/** Today in the browser's timezone, as `YYYY-MM-DD`. */
export function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
