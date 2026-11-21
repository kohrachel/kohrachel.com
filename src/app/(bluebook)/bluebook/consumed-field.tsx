"use client";

import { useId, useState, type ReactNode } from "react";
import type { DatePrecision } from "@/domain-types/bluebook/add";
import { readTypedDate, type ConsumedDate } from "@/lib/bluebook/dates";
import {
  formatDateLong,
  formatDateShort,
  isoDateAt,
} from "@/lib/bluebook/format";

const ROUGHLY: Record<DatePrecision, string> = {
  day: "",
  month: "sometime that month",
  year: "sometime that year",
};

/**
 * When you watched or read it, typed the way you'd say it: "2026", "May
 * 2026" or "20 May 2026". How much is typed sets the precision, and the
 * stamp under the box shows what will be saved. Reports the date, or
 * `null` while the text isn't one. `children` sit beside the box.
 */
export function ConsumedField({
  initial,
  onChange,
  label = "Watched or read",
  autoFocus = false,
  children,
}: {
  initial: ConsumedDate;
  onChange: (value: ConsumedDate | null) => void;
  label?: string;
  autoFocus?: boolean;
  children?: ReactNode;
}) {
  const id = useId();
  const [text, setText] = useState(() =>
    formatDateLong(initial.consumedOn, initial.consumedPrecision),
  );
  const [left, setLeft] = useState(false);
  const result = readTypedDate(text, localToday());

  return (
    <div className="bb-field bb-datefield">
      <span className="bb-field__head">
        <label className="bb-label" htmlFor={id}>
          {label}
        </label>
        <span className="bb-hint">A year, a month or a day</span>
      </span>
      <div className="bb-datefield__row">
        <input
          id={id}
          value={text}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          placeholder="2026, May 2026 or 20 May 2026"
          // Typing straight away replaces the date that's there.
          onFocus={(event) => event.target.select()}
          onBlur={() => setLeft(true)}
          onChange={(event) => {
            setText(event.target.value);
            const read = readTypedDate(event.target.value, localToday());
            onChange(read.ok ? read.value : null);
          }}
          aria-invalid={(left && !result.ok) || undefined}
          aria-describedby={`${id}-read`}
          className="bb-input"
        />
        {children}
      </div>
      <p
        id={`${id}-read`}
        aria-live="polite"
        className={`bb-datefield__read ${!result.ok && left ? "bb-datefield__read--error" : ""}`}
      >
        {result.ok ? (
          <>
            <time
              className="bb-stamp"
              dateTime={isoDateAt(
                result.value.consumedOn,
                result.value.consumedPrecision,
              )}
            >
              {formatDateShort(
                result.value.consumedOn,
                result.value.consumedPrecision,
              ).toUpperCase()}
            </time>
            {ROUGHLY[result.value.consumedPrecision]}
          </>
        ) : (
          result.error
        )}
      </p>
    </div>
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
