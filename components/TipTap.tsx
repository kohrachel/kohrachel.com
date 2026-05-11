"use client";

import { useEffect } from "react";
import type { Editor, JSONContent } from "@tiptap/core";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";
import {
  postBodyParagraphSpacing,
  postBodyHeadingStyles,
  postBodyTableStyles,
  postBodyTypography,
} from "@/lib/postBodyTypography";

interface TiptapProps {
  onEditor?: (editor: Editor | null) => void;
  content?: JSONContent;
}

export default function Tiptap({ onEditor, content }: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit.configure({
        table: {
          HTMLAttributes: {
            class: "post-table",
          },
          resizable: true,
          renderWrapper: true,
          cellMinWidth: 128,
        },
      }),
      Placeholder.configure({ placeholder: "Write something…" }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "true",
      },
    },
  });

  useEffect(() => {
    onEditor?.(editor);
    return () => onEditor?.(null);
  }, [editor, onEditor]);

  if (!editor) {
    return <LoadingText>Loading editor…</LoadingText>;
  }

  return (
    <EditorShell>
      <TableToolbar editor={editor} />
      <EditorContent editor={editor} />
    </EditorShell>
  );
}

function TableToolbar({ editor }: { editor: Editor }) {
  const runTableCommand = (command: () => boolean) => () => {
    command();
    editor.commands.focus();
  };

  return (
    <Toolbar aria-label="Table controls">
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true,
          }).run(),
        )}
      >
        Insert table
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().addRowAfter().run(),
        )}
      >
        Add row
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().addColumnAfter().run(),
        )}
      >
        Add column
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().deleteRow().run(),
        )}
      >
        Delete row
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().deleteColumn().run(),
        )}
      >
        Delete column
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().toggleHeaderRow().run(),
        )}
      >
        Toggle header
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().mergeOrSplit().run(),
        )}
      >
        Merge/split
      </ToolbarButton>
      <ToolbarButton
        type="button"
        onClick={runTableCommand(() =>
          editor.chain().focus().deleteTable().run(),
        )}
      >
        Delete table
      </ToolbarButton>
    </Toolbar>
  );
}

const LoadingText = styled.p`
  color: color-mix(in srgb, var(--header) 70%, transparent);
  padding: 0.5rem 0;
  margin: 0;
`;

const EditorShell = styled.div`
  width: 100%;

  ${postBodyTableStyles}

  .tiptap.ProseMirror {
    margin: 0;
    padding: 0;
    min-height: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    color: inherit;
    outline: none;
    box-shadow: none;

    ${postBodyTypography}
    ${postBodyParagraphSpacing}
    ${postBodyHeadingStyles}
    ${postBodyTableStyles}
  }
  .tiptap.ProseMirror:focus,
  .tiptap.ProseMirror:focus-visible {
    outline: none;
    box-shadow: none;
  }
  .tiptap p.is-editor-empty::before {
    color: color-mix(in srgb, var(--header) 70%, transparent);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ToolbarButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--header) 45%, transparent);
  border-radius: 999px;
  padding: 0.4rem 0.7rem;
  background: color-mix(in srgb, var(--primary) 85%, var(--header));
  color: var(--header);
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;
