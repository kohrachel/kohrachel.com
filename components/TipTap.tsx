"use client";

import { useEffect } from "react";
import { Editor } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";
import {
  postBodyParagraphSpacing,
  postBodyTypography,
} from "@/lib/postBodyTypography";

interface TiptapProps {
  onEditor?: (editor: Editor | null) => void;
}

export default function Tiptap({ onEditor }: TiptapProps) {
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
  color: var(--comment);
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
  }

  .tiptap.ProseMirror:focus,
  .tiptap.ProseMirror:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;
