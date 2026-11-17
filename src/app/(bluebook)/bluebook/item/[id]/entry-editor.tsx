"use client";

import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import {
  EditorContent,
  ReactRenderer,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import Link from "next/link";
import { useImperativeHandle, useState, useTransition, type Ref } from "react";
import { entryExtensions } from "@/components/bluebook/entry-extensions";
import type { MentionTarget } from "@/domain-types/bluebook/entries";
import { findMentionTargets, saveEntryText } from "@/server/bluebook/entries";
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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: "end",
    extensions: [
      ...entryExtensions({
        HTMLAttributes: { class: "mention" },
        suggestion: mentionSuggestion(itemId, basePath),
      }),
      Placeholder.configure({
        placeholder:
          "Write about it. Type @ to mention something you've saved.",
      }),
    ],
    content: content.content?.length ? content : undefined,
    editorProps: {
      attributes: {
        class: "entry-text min-h-24 px-3 py-2 outline-none",
        "aria-label": "Entry text",
      },
    },
  });

  function save() {
    if (!editor) return;
    // ProseMirror builds attributes without a prototype, which server
    // actions can't send as data; a JSON round trip makes them plain.
    const json = JSON.parse(JSON.stringify(editor.getJSON()));
    startTransition(async () => {
      try {
        const result = await saveEntryText({ entryId, content: json });
        if (result.ok) onDone();
        else setError(result.error);
      } catch {
        setError("Couldn't save. Try again, or check you're still logged in.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-stone-300 focus-within:border-stone-500">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending || !editor}
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

const TOOLS = [
  {
    name: "bold",
    label: "B",
    title: "Bold",
    run: (e: Editor) => e.chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    label: "I",
    title: "Italic",
    run: (e: Editor) => e.chain().focus().toggleItalic().run(),
  },
  {
    name: "bulletList",
    label: "•",
    title: "Bulleted list",
    run: (e: Editor) => e.chain().focus().toggleBulletList().run(),
  },
  {
    name: "orderedList",
    label: "1.",
    title: "Numbered list",
    run: (e: Editor) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    name: "blockquote",
    label: "❝",
    title: "Quote",
    run: (e: Editor) => e.chain().focus().toggleBlockquote().run(),
  },
] as const;

function Toolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      Object.fromEntries(
        TOOLS.map(({ name }) => [name, current.isActive(name)]),
      ),
  });
  return (
    <div className="flex gap-0.5 border-b border-stone-200 p-1 text-sm">
      {TOOLS.map(({ name, label, title, run }) => (
        <button
          key={name}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={active[name]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run(editor)}
          className={`min-w-7 rounded px-1.5 py-0.5 aria-pressed:bg-stone-900 aria-pressed:text-white ${
            name === "bold" ? "font-bold" : name === "italic" ? "italic" : ""
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

type MentionListHandle = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};
type MentionListProps = SuggestionProps<MentionTarget> & {
  basePath: string;
  ref?: Ref<MentionListHandle>;
};

/** The `@` picker: search as you type, pick with the mouse or arrow keys. */
function mentionSuggestion(
  itemId: number,
  basePath: string,
): Partial<SuggestionOptions<MentionTarget>> {
  return {
    items: ({ query }) =>
      findMentionTargets({ query, excludeItemId: itemId }).catch(() => []),
    command: ({ editor, range, props }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "mention",
            attrs: { id: String(props.id), label: props.title },
          },
          { type: "text", text: " " },
        ])
        .run();
    },
    render: () => {
      let picker: ReactRenderer<MentionListHandle, MentionListProps> | null =
        null;
      const place = (props: SuggestionProps<MentionTarget>) => {
        const rect = props.clientRect?.();
        if (!picker || !rect) return;
        Object.assign(picker.element.style, {
          position: "fixed",
          left: `${rect.left}px`,
          top: `${rect.bottom + 4}px`,
          zIndex: "50",
        });
      };
      return {
        onStart: (props) => {
          picker = new ReactRenderer(MentionList, {
            props: { ...props, basePath },
            editor: props.editor,
          });
          document.body.appendChild(picker.element);
          place(props);
        },
        onUpdate: (props) => {
          picker?.updateProps({ ...props, basePath });
          place(props);
        },
        onKeyDown: (props) => picker?.ref?.onKeyDown(props) ?? false,
        onExit: () => {
          picker?.element.remove();
          picker?.destroy();
          picker = null;
        },
      };
    },
  };
}

function MentionList({
  items,
  query,
  command,
  basePath,
  ref,
}: MentionListProps) {
  const [selected, setSelected] = useState(0);
  const [lastItems, setLastItems] = useState(items);
  if (items !== lastItems) {
    setLastItems(items);
    setSelected(0);
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false;
      if (event.key === "ArrowDown") {
        setSelected((selected + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((selected + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="flex w-72 max-w-[90vw] flex-col rounded-md border border-stone-300 bg-white p-1 text-sm shadow-lg">
      {items.length ? (
        items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command(item)}
            className={`flex flex-col rounded px-2 py-1 text-left ${
              index === selected ? "bg-stone-100" : ""
            }`}
          >
            <span className="truncate">{item.title}</span>
            <span className="text-xs text-stone-500">{item.platform}</span>
          </button>
        ))
      ) : (
        <p className="px-2 py-1 text-stone-500">
          {query ? "Nothing saved matches. " : "Nothing saved yet. "}
          <Link href={`${basePath}/add`} target="_blank" className="underline">
            Add it first
          </Link>
        </p>
      )}
    </div>
  );
}
