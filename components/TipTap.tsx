"use client";

import { useEffect } from "react";
import type { Editor, JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";
import {
  postBodyParagraphSpacing,
  postBodyHeadingStyles,
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
      <EditorContent editor={editor} />
    </EditorShell>
  );
}

const LoadingText = styled.p`
  color: color-mix(in srgb, var(--header) 70%, transparent);
  padding: 0.5rem 0;
  margin: 0;
`;

const EditorShell = styled.div`
  width: 100%;

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
