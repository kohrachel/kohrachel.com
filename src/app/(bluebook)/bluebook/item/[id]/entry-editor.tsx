"use client";

import type { JSONContent } from "@tiptap/core";
import {
  Fragment,
  useId,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  EntryEditor,
  type EntryEditorValue,
} from "@/components/bluebook/editor";
import { saveEntryText } from "@/server/bluebook/entries";
import { Notice } from "../../notice";
import { buttonClass, quietButtonClass } from "../../styles";

/**
 * An entry's text with "Edit" and the other `tools` under it. While editing,
 * the text is replaced by the editor; saving refreshes the page.
 */
export function EntryTextEditor({
  entryId,
  itemId,
  content,
  basePath,
  who,
  tools = [],
  children,
}: {
  entryId: number;
  itemId: number;
  content: JSONContent;
  basePath: string;
  /** Whose entry it is, shown beside "Edit entry". */
  who?: ReactNode;
  tools?: ReactNode[];
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <>
        {children}
        <div className="bb-entry__tools">
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
          {tools.map((tool, index) => (
            <Fragment key={index}>
              <span aria-hidden="true">·</span>
              {tool}
            </Fragment>
          ))}
        </div>
      </>
    );
  }
  return (
    <Editing
      entryId={entryId}
      itemId={itemId}
      content={content}
      basePath={basePath}
      who={who}
      onDone={() => setEditing(false)}
    />
  );
}

function Editing({
  entryId,
  itemId,
  content,
  basePath,
  who,
  onDone,
}: {
  entryId: number;
  itemId: number;
  content: JSONContent;
  basePath: string;
  who?: ReactNode;
  onDone: () => void;
}) {
  const labelId = useId();
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
    <section className="bb-editor" aria-label="Edit entry">
      <div className="bb-log__head">
        <h3 className="bb-section-title">Edit entry</h3>
        {who}
      </div>
      <div className="bb-field">
        <span className="bb-field__head">
          <span className="bb-label" id={labelId}>
            What did you think?
          </span>
          <span className="bb-hint">
            Optional · type @ to mention something you&apos;ve saved
          </span>
        </span>
        <EntryEditor
          content={content}
          onChange={setValue}
          excludeItemId={itemId}
          basePath={basePath}
          placeholder="A line or a page."
          labelledBy={labelId}
          autofocus
        />
      </div>
      {error && <Notice kind="error" title={error} />}
      <div className="bb-row">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className={buttonClass}
        >
          {pending ? "Saving…" : "Save entry"}
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
    </section>
  );
}
