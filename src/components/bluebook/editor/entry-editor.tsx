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
import { useImperativeHandle, useState, type Ref } from "react";
import { Highlighted } from "../highlighted";
import type { MentionTarget } from "@/domain-types/bluebook/entries";
import { findMentionTargets } from "@/server/bluebook/entries";
import { entryExtensions } from "./extensions";

/** What the editor holds, as plain JSON a server action can take. */
export type EntryEditorValue = { content: JSONContent; isEmpty: boolean };

/**
 * The editor for an entry's text: bold, italic, lists and quotes, and `@`
 * to mention a saved item. It reports every change; saving is up to the
 * screen it's on.
 */
export function EntryEditor({
  content,
  onChange,
  excludeItemId,
  basePath,
  placeholder = "Write about it. Type @ to mention something you've saved.",
  autofocus = false,
  labelledBy,
}: {
  content?: JSONContent;
  onChange: (value: EntryEditorValue) => void;
  /** The entry's own item, left out of the `@` picker. */
  excludeItemId?: number;
  /** Where bluebook's pages start, for the picker's "Add it first" link. */
  basePath: string;
  placeholder?: string;
  autofocus?: boolean;
  /** The id of a label for the text box; without one it's "Entry text". */
  labelledBy?: string;
}) {
  // The page can be hidden and shown again, which rebuilds the editor; this
  // starts it from what was typed, not from `content`.
  const [latest, setLatest] = useState(content);
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autofocus ? "end" : false,
    extensions: [
      ...entryExtensions({
        HTMLAttributes: { class: "bb-mention" },
        suggestion: mentionSuggestion(excludeItemId, basePath),
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: latest?.content?.length ? latest : undefined,
    editorProps: {
      attributes: {
        class: "bb-sheet-input bb-prose",
        role: "textbox",
        "aria-multiline": "true",
        ...(labelledBy
          ? { "aria-labelledby": labelledBy }
          : { "aria-label": "Entry text" }),
      },
    },
    onUpdate: ({ editor: current }) => {
      // ProseMirror builds attributes without a prototype, which server
      // actions can't send as data; a JSON round trip makes them plain.
      const json: JSONContent = JSON.parse(JSON.stringify(current.getJSON()));
      setLatest(json);
      onChange({ content: json, isEmpty: current.isEmpty });
    },
  });

  return (
    <>
      {editor && <Toolbar editor={editor} />}
      <div className="bb-editor__box">
        <EditorContent editor={editor} />
      </div>
    </>
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
    <div className="bb-seg self-start" role="group" aria-label="Formatting">
      {TOOLS.map(({ name, label, title, run }) => (
        <button
          key={name}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={active[name]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run(editor)}
          className={
            name === "bold" ? "font-bold" : name === "italic" ? "italic" : ""
          }
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
  excludeItemId: number | undefined,
  basePath: string,
): Partial<SuggestionOptions<MentionTarget>> {
  return {
    items: ({ query }) =>
      findMentionTargets({ query, excludeItemId }).catch(() => []),
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
          left: `${Math.max(8, Math.min(rect.left, window.innerWidth - 348))}px`,
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
    <div
      className="bb-picker"
      role="listbox"
      aria-label="Mention something you've saved"
      style={{ position: "relative", width: "min(340px, calc(100vw - 16px))" }}
    >
      {items.length ? (
        items.map((item, index) => (
          <div
            key={item.id}
            role="option"
            aria-selected={index === selected}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command(item)}
            className="bb-picker__opt"
          >
            <span
              aria-hidden="true"
              className="bb-linkrow__pic bb-linkrow__pic--note"
            />
            <span className="bb-picker__title">
              <Highlighted text={item.title} words={query ? [query] : []} />
            </span>
            <span className="bb-picker__meta">{item.platform}</span>
          </div>
        ))
      ) : (
        <p className="bb-picker__empty">
          {query ? `Nothing saved matches “${query}”. ` : "Nothing saved yet. "}
          <Link
            href={`${basePath}/add`}
            target="_blank"
            className="text-cover underline"
          >
            Add it first
          </Link>
          , then mention it.
        </p>
      )}
    </div>
  );
}
