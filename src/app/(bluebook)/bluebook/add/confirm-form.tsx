"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import {
  EntryEditor,
  type EntryEditorValue,
} from "@/components/bluebook/editor";
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
import { saveLink } from "@/server/bluebook/add";
import { ConsumedField, today } from "../consumed-field";
import { Notice } from "../notice";
import { DateField } from "../date-field";
import { buttonClass, inputClass } from "../styles";
import { platformLabel } from "./preview-view";

type Preview = Extract<PreviewResult, { ok: true }>;
export type Saved = Extract<SaveResult, { ok: true }>;
/** The title and creator as typed, for the preview beside the form. */
export type Draft = { title: string; creator: string };

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

/** The title and creator the form starts with. */
export function initialDraft(preview: Preview): Draft {
  const details = preview.details?.details;
  return {
    title: details?.title ?? preview.existing?.title ?? "",
    creator: details?.creator ?? preview.existing?.creator ?? "",
  };
}

/**
 * The confirm form. For a link you already have, it only asks when you
 * watched or read it; otherwise it's pre-filled with the fetched details.
 */
export function ConfirmForm({
  preview,
  onSaved,
  onDraftChange,
  basePath,
}: {
  preview: Preview;
  onSaved: (saved: Saved) => void;
  onDraftChange: (draft: Draft) => void;
  basePath: string;
}) {
  const { existing } = preview;
  const details = preview.details?.details;
  const sources = preview.details?.sources ?? {};
  const entryOnly = existing !== null && !existing.isDeleted;
  const initialPublishedAt =
    details?.publishedAt ?? existing?.publishedAt ?? null;
  const initial = initialDraft(preview);
  const textLabelId = useId();

  const [draft, setDraft] = useState(initial);
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

  function updateDraft(change: Partial<Draft>) {
    const next = { ...draft, ...change };
    setDraft(next);
    onDraftChange(next);
  }

  function save() {
    if (!consumed) return;
    const input: SaveInput = {
      url: preview.url,
      resolvedUrl: preview.resolvedUrl,
      title: draft.title,
      creator: draft.creator,
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

  // Only what still holds the fetched value is tinted and tagged.
  const edited: Partial<Record<DetailField, boolean>> = {
    title: draft.title !== initial.title,
    creator: draft.creator !== initial.creator,
    publishedAt: publishedOn !== dateInputValue(initialPublishedAt),
  };
  const fetchedFrom = (field: DetailField) =>
    edited[field] ? undefined : sources[field];
  const filled = (field: DetailField) =>
    fetchedFrom(field) ? "bb-input--filled" : "";
  const tag = (field: DetailField) => {
    const source = fetchedFrom(field);
    return (
      source && (
        <span className="bb-tag">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
          from {SOURCE_LABELS[source]}
        </span>
      )
    );
  };

  return (
    <form
      className="bb-form"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Fetched preview={preview} tag={tag} />

      {!entryOnly && (
        <>
          {preview.details && Object.keys(sources).length === 0 && (
            <Notice title="Couldn't fetch any details, so fill them in.">
              The link is saved either way.
            </Notice>
          )}
          <Field label="Title" tag={tag("title")}>
            <input
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              required
              maxLength={500}
              placeholder="What is it called?"
              className={`${inputClass} ${filled("title")}`}
            />
          </Field>
          <Field label="Creator" tag={tag("creator")}>
            <input
              value={draft.creator}
              onChange={(event) => updateDraft({ creator: event.target.value })}
              maxLength={300}
              placeholder="Who made it"
              className={`${inputClass} ${filled("creator")}`}
            />
          </Field>
          <Field label="Published" tag={tag("publishedAt")} narrow>
            <DateField
              label="Published"
              value={publishedOn}
              onChange={setPublishedOn}
              className={filled("publishedAt")}
            />
          </Field>
          <label className="bb-check">
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
        initial={today()}
        onChange={setConsumed}
        label="When did you watch or read it?"
      />

      <div className="bb-field">
        <span className="bb-field__head">
          <span className="bb-label" id={textLabelId}>
            What did you think?
          </span>
          <span className="bb-hint">
            Optional · type @ to mention something you&apos;ve saved
          </span>
        </span>
        <EntryEditor
          onChange={setText}
          excludeItemId={existing?.id}
          basePath={basePath}
          placeholder="A line or a page, now or later."
          labelledBy={textLabelId}
        />
      </div>

      {error && <Notice kind="error" title={error} />}
      {textFailure ? (
        <Notice
          kind="error"
          title={`Saved the link, but not your text (${textFailure.message}).`}
        >
          Copy your text, then{" "}
          <Link
            href={`${basePath}/item/${textFailure.itemId}`}
            className="bb-link"
          >
            open the item
          </Link>{" "}
          to add it there.
        </Notice>
      ) : (
        <div className="bb-row">
          <button
            type="submit"
            disabled={
              pending || !consumed || (!entryOnly && !draft.title.trim())
            }
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
        </div>
      )}
    </form>
  );
}

/**
 * The link being saved, with the fetched details that are saved as they
 * are: length, size and description.
 */
function Fetched({
  preview,
  tag,
}: {
  preview: Preview;
  tag: (field: DetailField) => React.ReactNode;
}) {
  const details = preview.details?.details;
  const size =
    details?.width && details.height
      ? `${details.width}×${details.height}${details.height > details.width ? " (vertical)" : ""}`
      : null;
  const facts = [
    details?.durationSeconds && formatDuration(details.durationSeconds),
    size,
  ].filter(Boolean);

  return (
    <div className="bb-stack gap-2">
      <div className="bb-fetched">
        <span className="bb-tag">{platformLabel(preview)}</span>
        <Link
          href={preview.normalizedUrl}
          target="_blank"
          rel="noreferrer"
          className="bb-fetched__url"
        >
          {preview.normalizedUrl.replace(/^https?:\/\/(www\.)?/, "")}
        </Link>
        {facts.length > 0 && (
          <span className="bb-hint text-[13px]/5">{facts.join(" · ")}</span>
        )}
      </div>
      {details?.description && (
        <p className="bb-hint line-clamp-3 text-[13px]/5 whitespace-pre-line">
          {details.description} {tag("description")}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  tag,
  narrow = false,
  children,
}: {
  label: string;
  tag?: React.ReactNode;
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`bb-field ${narrow ? "max-w-60" : ""}`}>
      <span className="bb-field__head">
        <span className="bb-label">{label}</span>
        {tag}
      </span>
      {children}
    </label>
  );
}
