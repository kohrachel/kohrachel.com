"use client";

import { useState, useTransition } from "react";
import { saveLink } from "@/server/bluebook/add";
import {
  DATE_PRECISIONS,
  type DatePrecision,
  type PreviewResult,
  type SaveInput,
  type SaveResult,
} from "@/domain-types/bluebook/add";
import type {
  DetailField,
  DetailsSource,
} from "@/domain-types/bluebook/details";
import { dateInputValue, publishedAtFromInput } from "@/lib/bluebook/dates";
import { formatDuration } from "@/lib/bluebook/format";
import { buttonClass, dateInputClass, inputClass } from "../styles";

type Preview = Extract<PreviewResult, { ok: true }>;
export type Saved = Extract<SaveResult, { ok: true }>;

const SOURCE_LABELS: Record<DetailsSource, string> = {
  youtube_api: "YouTube API",
  bilibili_api: "Bilibili API",
  wikipedia_api: "Wikipedia API",
  linkedin_embed: "LinkedIn embed",
  oembed: "oEmbed",
  page_meta: "page",
  share_text: "share text",
  link: "link",
};

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
 * The confirm form. For a link you already have, it only asks when you
 * watched or read it; otherwise it's pre-filled with the fetched details.
 */
export function ConfirmForm({
  preview,
  onSaved,
}: {
  preview: Preview;
  onSaved: (saved: Saved) => void;
}) {
  const { existing } = preview;
  const details = preview.details?.details;
  const sources = preview.details?.sources ?? {};
  const entryOnly = existing !== null && !existing.isDeleted;
  const initialPublishedAt =
    details?.publishedAt ?? existing?.publishedAt ?? null;

  const [title, setTitle] = useState(details?.title ?? existing?.title ?? "");
  const [creator, setCreator] = useState(
    details?.creator ?? existing?.creator ?? "",
  );
  const [publishedOn, setPublishedOn] = useState(
    dateInputValue(initialPublishedAt),
  );
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite ?? false);
  const [consumedOn, setConsumedOn] = useState(localToday);
  const [consumedPrecision, setConsumedPrecision] =
    useState<DatePrecision>("day");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const input: SaveInput = {
      url: preview.url,
      resolvedUrl: preview.resolvedUrl,
      title,
      creator,
      publishedAt: publishedAtFromInput(initialPublishedAt, publishedOn),
      metadata: details
        ? {
            description: details.description,
            thumbnailUrl: details.thumbnailUrl,
            durationSeconds: details.durationSeconds,
            width: details.width,
            height: details.height,
            playerId: details.playerId,
          }
        : {},
      isFavorite,
      consumedOn,
      consumedPrecision,
    };
    startTransition(async () => {
      try {
        const result = await saveLink(input);
        if (result.ok) onSaved(result);
        else setError(result.error);
      } catch {
        setError("Couldn't save. Try again, or check you're still logged in.");
      }
    });
  }

  const hint = (field: DetailField) =>
    sources[field] && (
      <span className="text-xs text-stone-400">
        from {SOURCE_LABELS[sources[field]]}
      </span>
    );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {!entryOnly && (
        <>
          {preview.details && Object.keys(sources).length === 0 && (
            <p className="text-sm text-stone-500">
              Couldn&apos;t fetch any details, so fill them in.
            </p>
          )}
          {details && <FetchedOnly details={details} hint={hint} />}

          <Field label="Title" hint={hint("title")}>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={500}
              className={inputClass}
            />
          </Field>
          <Field label="Creator" hint={hint("creator")}>
            <input
              value={creator}
              onChange={(event) => setCreator(event.target.value)}
              maxLength={300}
              className={inputClass}
            />
          </Field>
          <Field label="Published" hint={hint("publishedAt")}>
            <input
              type="date"
              value={publishedOn}
              onChange={(event) => setPublishedOn(event.target.value)}
              className={dateInputClass}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(event) => setIsFavorite(event.target.checked)}
            />
            Favorite
          </label>
        </>
      )}

      <ConsumedField
        date={consumedOn}
        precision={consumedPrecision}
        onDateChange={setConsumedOn}
        onPrecisionChange={setConsumedPrecision}
      />

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || (!entryOnly && !title.trim())}
        className={buttonClass}
      >
        {pending
          ? "Saving…"
          : entryOnly
            ? "Add entry"
            : existing?.isDeleted
              ? "Restore"
              : "Save"}
      </button>
    </form>
  );
}

/** Fetched details that are saved as they are, not edited. */
function FetchedOnly({
  details,
  hint,
}: {
  details: NonNullable<Preview["details"]>["details"];
  hint: (field: DetailField) => React.ReactNode;
}) {
  const size =
    details.width && details.height
      ? `${details.width}×${details.height}${details.height > details.width ? " (vertical)" : ""}`
      : null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      {details.thumbnailUrl && (
        <img
          src={details.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-60 w-fit max-w-full rounded-md object-contain"
        />
      )}
      {(details.durationSeconds || size) && (
        <p className="text-stone-500">
          {details.durationSeconds && (
            <>
              {formatDuration(details.durationSeconds)}{" "}
              {hint("durationSeconds")}{" "}
            </>
          )}
          {size && (
            <>
              {size} {hint("width")}
            </>
          )}
        </p>
      )}
      {details.description && (
        <p className="line-clamp-4 whitespace-pre-line text-stone-600">
          {details.description} {hint("description")}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-stone-500">
        {label} {hint}
      </span>
      {children}
    </label>
  );
}

/**
 * When you watched or read it. The date is always a full `YYYY-MM-DD`; with
 * month or year precision only that part is shown and changed.
 */
function ConsumedField({
  date,
  precision,
  onDateChange,
  onPrecisionChange,
}: {
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
      <legend className="mb-1 text-stone-500">Watched or read</legend>
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
function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
