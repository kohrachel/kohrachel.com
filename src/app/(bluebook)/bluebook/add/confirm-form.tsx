"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  EntryEditor,
  type EntryEditorValue,
} from "@/components/bluebook/editor";
import { saveLink } from "@/server/bluebook/add";
import type {
  PreviewResult,
  SaveInput,
  SaveResult,
} from "@/domain-types/bluebook/add";
import type {
  DetailField,
  DetailsSource,
} from "@/domain-types/bluebook/details";
import {
  dateInputValue,
  publishedAtFromInput,
  type ConsumedDate,
} from "@/lib/bluebook/dates";
import { formatDuration } from "@/lib/bluebook/format";
import { ConsumedField, today } from "../consumed-field";
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

/**
 * The confirm form. For a link you already have, it only asks when you
 * watched or read it; otherwise it's pre-filled with the fetched details.
 */
export function ConfirmForm({
  preview,
  onSaved,
  basePath,
}: {
  preview: Preview;
  onSaved: (saved: Saved) => void;
  basePath: string;
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
  const [consumed, setConsumed] = useState<ConsumedDate | null>(today);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [text, setText] = useState<EntryEditorValue | null>(null);
  const [textFailure, setTextFailure] = useState<{
    itemId: number;
    message: string;
  } | null>(null);

  function save() {
    if (!consumed) return;
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
            thumbnailWidth: details.thumbnailWidth,
            thumbnailHeight: details.thumbnailHeight,
            durationSeconds: details.durationSeconds,
            width: details.width,
            height: details.height,
            playerId: details.playerId,
          }
        : {},
      isFavorite,
      ...consumed,
    };
    startTransition(async () => {
      try {
        const result = await saveLink(
          input,
          text && !text.isEmpty ? text.content : undefined,
        );
        if (!result.ok) setError(result.error);
        // Stay here, so the text isn't lost.
        else if (result.textError) {
          setTextFailure({ itemId: result.itemId, message: result.textError });
        } else onSaved(result);
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

      <ConsumedField initial={today()} onChange={setConsumed} />

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-stone-500">Write about it (optional)</span>
        <EntryEditor
          onChange={setText}
          excludeItemId={existing?.id}
          basePath={basePath}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {textFailure ? (
        <p role="alert" className="text-sm text-red-700">
          Saved the link, but not your text ({textFailure.message}). Copy your
          text, then{" "}
          <Link
            href={`${basePath}/item/${textFailure.itemId}`}
            className="underline"
          >
            open the item
          </Link>{" "}
          to add it there.
        </p>
      ) : (
        <button
          type="submit"
          disabled={pending || !consumed || (!entryOnly && !title.trim())}
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
      )}
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
