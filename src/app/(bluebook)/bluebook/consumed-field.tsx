"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  dateParts,
  readDateParts,
  type ConsumedDate,
  type DateParts,
} from "@/lib/bluebook/dates";
import { formatDate } from "@/lib/bluebook/format";
import { fieldClass, quietButtonClass } from "./styles";

const PART_FIELDS = [
  {
    part: "year",
    label: "Year",
    placeholder: "YYYY",
    length: 4,
    width: "w-20",
  },
  {
    part: "month",
    label: "Month",
    placeholder: "MM",
    length: 2,
    width: "w-16",
  },
  { part: "day", label: "Day", placeholder: "DD", length: 2, width: "w-16" },
] as const;

/**
 * When you watched or read it: a year, then optionally a month, then
 * optionally a day. What's filled in sets the precision. Reports the date,
 * or `null` while the boxes don't describe one.
 */
export function ConsumedField({
  initial,
  onChange,
  label = "Watched or read",
}: {
  initial: ConsumedDate;
  onChange: (value: ConsumedDate | null) => void;
  label?: string;
}) {
  const [parts, setParts] = useState<DateParts>(() =>
    dateParts(initial.consumedOn, initial.consumedPrecision),
  );
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const result = readDateParts(parts, localToday());

  function update(next: DateParts) {
    setParts(next);
    const read = readDateParts(next, localToday());
    onChange(read.ok ? read.value : null);
  }

  return (
    <fieldset className="flex flex-col gap-1.5 text-sm">
      <legend className="mb-1 text-stone-500">{label}</legend>
      <div className="flex flex-wrap items-end gap-2">
        {PART_FIELDS.map(
          ({ part, label: name, placeholder, length, width }, i) => (
            <label key={part} className="flex flex-col gap-1">
              <span className="text-xs text-stone-500">
                {name}
                {part !== "year" && " (optional)"}
              </span>
              <input
                ref={(box) => {
                  boxes.current[i] = box;
                }}
                value={parts[part]}
                inputMode="numeric"
                // Typing into a filled box replaces what's there.
                onFocus={(event) => event.target.select()}
                placeholder={placeholder}
                maxLength={length}
                aria-invalid={!result.ok || undefined}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");
                  update({ ...parts, [part]: value });
                  // Move on once the part can't take another digit.
                  const full =
                    value.length === length ||
                    (part === "month" && Number(value) > 1) ||
                    (part === "day" && Number(value) > 3);
                  if (full && value !== parts[part])
                    boxes.current[i + 1]?.focus();
                }}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Backspace" && !parts[part] && i > 0) {
                    event.preventDefault();
                    boxes.current[i - 1]?.focus();
                  }
                }}
                className={`${fieldClass} ${width} text-center tabular-nums aria-invalid:border-red-400`}
              />
            </label>
          ),
        )}
        <button
          type="button"
          onClick={() => {
            const [year, month, day] = localToday().split("-");
            update({ year, month, day });
          }}
          className={quietButtonClass}
        >
          Set to today
        </button>
      </div>
      <p
        aria-live="polite"
        className={result.ok ? "text-stone-500" : "text-red-700"}
      >
        {result.ok
          ? formatDate(result.value.consumedOn, result.value.consumedPrecision)
          : result.error}
      </p>
    </fieldset>
  );
}

/** Today in the browser's timezone, as `YYYY-MM-DD`. */
export function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Today, to the day: the starting value when adding an entry. */
export function today(): ConsumedDate {
  return { consumedOn: localToday(), consumedPrecision: "day" };
}
