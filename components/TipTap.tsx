"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";

export default function Tiptap() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "true",
      },
    },
  });

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
  color: var(--comment);
  padding: 0.5rem 0;
  margin: 0;
`;

const EditorShell = styled.div`
  width: 100%;

  .tiptap.ProseMirror {
    min-height: 12rem;
    padding: 1rem 1.15rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--comment) 55%, transparent);
    background: color-mix(in srgb, var(--selection) 28%, var(--background));
    color: var(--foreground);
    outline: none;
  }

  .tiptap.ProseMirror:focus-visible {
    border-color: color-mix(in srgb, var(--purple) 50%, var(--comment));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--purple) 22%, transparent);
  }

  .tiptap.ProseMirror p {
    margin: 0;
  }

  .tiptap.ProseMirror p + p {
    margin-top: 0.75em;
  }
`;
