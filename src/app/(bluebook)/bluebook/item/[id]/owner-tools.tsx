"use client";

import { useRouter } from "next/navigation";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition, type ReactNode } from "react";
import type { DatePrecision } from "@/domain-types/bluebook/add";
import type { EditResult } from "@/domain-types/bluebook/edit";
import {
  dateInputValue,
  publishedAtFromInput,
  type ConsumedDate,
} from "@/lib/bluebook/dates";
import { formatDateLong } from "@/lib/bluebook/format";
import {
  addEntry,
  deleteEntry,
  deleteItem,
  setFavorite,
  updateEntryDate,
  updateItem,
} from "@/server/bluebook/edit";
import { ConsumedField, today } from "../../consumed-field";
import { DateField } from "../../date-field";
import { Notice } from "../../notice";
import { Star } from "../../star";
import {
  buttonClass,
  inputClass,
  outlineButtonClass,
  quietButtonClass,
} from "../../styles";

type EditableItem = {
  id: number;
  title: string;
  creator: string | null;
  publishedAt: string | null;
  isFavorite: boolean;
};

const FAILED = "Couldn't save. Try again, or check you're still logged in.";

/** Runs an edit, keeping its pending state and error message. */
function useEdit() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<EditResult>, onDone?: () => void) =>
    startTransition(async () => {
      try {
        const result = await action();
        setError(result.ok ? null : result.error);
        if (result.ok) onDone?.();
      } catch {
        setError(FAILED);
      }
    });
  return { error, pending, run };
}

/**
 * Edit, favorite and, when allowed, delete, for signed-in people. `basePath`
 * is where bluebook starts.
 */
export function ItemTools({
  item,
  canDelete,
  basePath,
}: {
  item: EditableItem;
  canDelete: boolean;
  basePath: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const { error, pending, run } = useEdit();

  return (
    <>
      {mode === "edit" ? (
        <EditForm
          item={item}
          pending={pending}
          onCancel={() => setMode("view")}
          onSave={(input) =>
            run(
              () => updateItem(input),
              () => setMode("view"),
            )
          }
        />
      ) : (
        <div className="bb-row">
          <button
            type="button"
            disabled={pending}
            onClick={() => setMode("edit")}
            className={outlineButtonClass}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={pending}
            aria-pressed={item.isFavorite}
            onClick={() =>
              run(() =>
                setFavorite({ id: item.id, isFavorite: !item.isFavorite }),
              )
            }
            className={outlineButtonClass}
          >
            {item.isFavorite && <Star />}
            {item.isFavorite ? "Unfavorite" : "Favorite"}
          </button>
          {canDelete && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setMode("delete")}
              className={quietButtonClass}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {mode === "delete" && (
        <Notice kind="error" title="Delete this item?">
          <p>
            It leaves the feed and search, and shows as [removed] where entries
            mention it. Pasting its link again brings it back.
          </p>
          <div className="bb-row mt-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => deleteItem({ id: item.id }),
                  () => router.push(basePath || "/"),
                )
              }
              className={outlineButtonClass}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setMode("view")}
              className={quietButtonClass}
            >
              Keep it
            </button>
          </div>
        </Notice>
      )}

      {error && <Notice kind="error" title={error} />}
    </>
  );
}

function EditForm({
  item,
  pending,
  onCancel,
  onSave,
}: {
  item: EditableItem;
  pending: boolean;
  onCancel: () => void;
  onSave: (input: Parameters<typeof updateItem>[0]) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [creator, setCreator] = useState(item.creator ?? "");
  const [publishedOn, setPublishedOn] = useState(
    dateInputValue(item.publishedAt),
  );

  return (
    <form
      className="bb-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: item.id,
          title,
          creator,
          publishedAt: publishedAtFromInput(item.publishedAt, publishedOn),
        });
      }}
    >
      <label className="bb-field">
        <span className="bb-label">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={500}
          className={inputClass}
        />
      </label>
      <label className="bb-field">
        <span className="bb-label">Creator</span>
        <input
          value={creator}
          onChange={(event) => setCreator(event.target.value)}
          maxLength={300}
          placeholder="Who made it"
          className={inputClass}
        />
      </label>
      <label className="bb-field">
        <span className="bb-label">Published</span>
        <DateField
          label="Published"
          value={publishedOn}
          onChange={setPublishedOn}
        />
      </label>
      <div className="bb-row">
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className={buttonClass}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className={quietButtonClass}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Deletes one entry, after asking in place. */
export function DeleteEntryButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const { error, pending, run } = useEdit();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }
  return (
    <>
      <span>Delete this entry?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => deleteEntry({ id }))}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
      {error && (
        <span role="alert" className="text-margin-red">
          {error}
        </span>
      )}
    </>
  );
}

/**
 * An entry's date stamp, which the owner clicks to change when it was
 * watched or read.
 */
export function EntryDateButton({
  id,
  consumedOn,
  consumedPrecision,
  children,
}: {
  id: number;
  consumedOn: string;
  consumedPrecision: DatePrecision;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const { error, pending, run } = useEdit();
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Change date"
        aria-label={`Change date, ${formatDateLong(consumedOn, consumedPrecision)}`}
        className="bb-entry__date-btn"
      >
        {children}
      </button>
    );
  }
  return (
    <EntryDateForm
      initial={{ consumedOn, consumedPrecision }}
      label="Change the date"
      submitLabel="Save date"
      pending={pending}
      error={error}
      onCancel={() => setEditing(false)}
      onSave={(date) =>
        run(
          () => updateEntryDate({ id, ...date }),
          () => setEditing(false),
        )
      }
    />
  );
}

/** Adds an entry, for watching or reading it again, without pasting the link. */
export function AddEntryButton({
  itemId,
  who,
}: {
  itemId: number;
  /** "Writing as" you, shown while adding. */
  who?: ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  const { error, pending, run } = useEdit();
  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className={outlineButtonClass}
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.8} />
        Add entry
      </button>
    );
  }
  return (
    <EntryDateForm
      initial={today()}
      label="When did you watch or read it again?"
      submitLabel="Add entry"
      who={who}
      pending={pending}
      error={error}
      onCancel={() => setAdding(false)}
      onSave={(date) =>
        run(
          () => addEntry({ itemId, ...date }),
          () => setAdding(false),
        )
      }
    />
  );
}

/** A date to type, with Save and Cancel beside it. Escape cancels. */
function EntryDateForm({
  initial,
  label,
  submitLabel,
  who,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initial: ConsumedDate;
  label: string;
  submitLabel: string;
  who?: ReactNode;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (date: ConsumedDate) => void;
}) {
  const [consumed, setConsumed] = useState<ConsumedDate | null>(initial);
  return (
    <form
      className="bb-dateform"
      onSubmit={(event) => {
        event.preventDefault();
        if (consumed) onSave(consumed);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !pending) onCancel();
      }}
    >
      {who}
      <ConsumedField
        initial={initial}
        onChange={setConsumed}
        label={label}
        autoFocus
      >
        <button
          type="submit"
          disabled={pending || !consumed}
          className={buttonClass}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className={quietButtonClass}
        >
          Cancel
        </button>
      </ConsumedField>
      {error && <Notice kind="error" title={error} />}
    </form>
  );
}
