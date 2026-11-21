"use client";

import type { JSONContent } from "@tiptap/core";
import { useState, useTransition } from "react";
import {
  EntryEditor,
  type EntryEditorValue,
} from "@/components/bluebook/editor";
import { saveEntryText } from "@/server/bluebook/entries";
import { buttonClass, quietButtonClass } from "../../styles";

/**
 * An entry's text, with a button to write or edit it. While editing, the
 * text is replaced by the editor; saving refreshes the page.
 */
export function EntryTextEditor({
  entryId,
  itemId,
  content,
  hasText,
  basePath,
  children,
}: {
  entryId: number;
  itemId: number;
  content: JSONContent;
  hasText: boolean;
  basePath: string;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={quietButtonClass}
        >
          {hasText ? "Edit text" : "Write"}
        </button>
      </>
    );
  }
  return (
    <Editing
      entryId={entryId}
      itemId={itemId}
      content={content}
      basePath={basePath}
      onDone={() => setEditing(false)}
    />
  );
}

function Editing({
  entryId,
  itemId,
  content,
  basePath,
  onDone,
}: {
  entryId: number;
  itemId: number;
  content: JSONContent;
  basePath: string;
  onDone: () => void;
}) {
  const [value, setValue] = useState<EntryEditorValue>({
    content,
    isEmpty: !content.content?.length,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const result = await saveEntryText({
          entryId,
          content: value.content,
        });
        if (result.ok) onDone();
        else setError(result.error);
      } catch {
        setError("Couldn't save. Try again, or check you're still logged in.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <EntryEditor
        content={content}
        onChange={setValue}
        excludeItemId={itemId}
        basePath={basePath}
        autofocus
      />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className={buttonClass}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className={quietButtonClass}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
