"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EditResult } from "@/domain-types/bluebook/edit";
import { dateInputValue, publishedAtFromInput } from "@/lib/bluebook/dates";
import {
  deleteEntry,
  deleteItem,
  setFavorite,
  updateItem,
} from "@/server/bluebook/edit";
import {
  buttonClass,
  dateInputClass,
  inputClass,
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

/** Favorite, edit and delete, for the owner. `basePath` is where bluebook starts. */
export function ItemTools({
  item,
  basePath,
}: {
  item: EditableItem;
  basePath: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const { error, pending, run } = useEdit();

  return (
    <section className="flex flex-col gap-3 rounded-md border border-dashed border-stone-300 p-3 text-sm">
      {mode === "view" && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() =>
                setFavorite({ id: item.id, isFavorite: !item.isFavorite }),
              )
            }
            className={quietButtonClass}
          >
            {item.isFavorite ? "★ Unfavorite" : "☆ Favorite"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setMode("edit")}
            className={quietButtonClass}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setMode("delete")}
            className={quietButtonClass}
          >
            Delete
          </button>
        </div>
      )}

      {mode === "edit" && (
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
      )}

      {mode === "delete" && (
        <div className="flex flex-col gap-2">
          <p>
            Delete this item? It disappears from the site; pasting its link
            again brings it back, with its entries.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => deleteItem({ id: item.id }),
                  () => router.push(basePath || "/"),
                )
              }
              className={buttonClass}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setMode("view")}
              className={quietButtonClass}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
    </section>
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
      className="flex flex-col gap-3"
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
      <label className="flex flex-col gap-1">
        <span className="text-stone-500">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={500}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-stone-500">Creator</span>
        <input
          value={creator}
          onChange={(event) => setCreator(event.target.value)}
          maxLength={300}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-stone-500">Published</span>
        <input
          type="date"
          value={publishedOn}
          onChange={(event) => setPublishedOn(event.target.value)}
          className={dateInputClass}
        />
      </label>
      <div className="flex gap-2">
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

/** Deletes one entry, after asking. */
export function DeleteEntryButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const { error, pending, run } = useEdit();

  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-sm">
      {confirming ? (
        <>
          <span>Delete this entry?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => deleteEntry({ id }))}
            className={quietButtonClass}
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className={quietButtonClass}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={quietButtonClass}
        >
          Delete
        </button>
      )}
      {error && (
        <span role="alert" className="text-red-700">
          {error}
        </span>
      )}
    </span>
  );
}
