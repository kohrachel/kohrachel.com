"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor, JSONContent } from "@tiptap/core";
import styled from "styled-components";
import Tiptap from "@components/TipTap";
import Clouds from "@components/Clouds";
import {
  PostBodyColumn,
  PostHeaderSection,
  PostPageShell,
  PostTitleInput,
} from "@/lib/postPageLayout";
import { Button } from "@components/Button";

interface EditorClientProps {
  initialTitle?: string;
  initialContent?: JSONContent;
  postId?: string;
  originalSlug?: string;
}

export default function EditorClient({
  initialTitle,
  initialContent,
  postId,
  originalSlug,
}: EditorClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [currentPostId, setCurrentPostId] = useState(postId);
  const [currentSlug, setCurrentSlug] = useState(originalSlug);
  const editorRef = useRef<Editor | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const handleBack = () => {
    router.push(currentSlug ? `/${currentSlug}` : "/");
  };

  const handleExport = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    setExporting(true);
    try {
      const doc = editor.getJSON();
      const res = await fetch("/api/export-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          doc,
          id: currentPostId,
          originalSlug: currentSlug,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Export failed:", err);
        alert(`Export failed: ${err.error ?? res.statusText}`);
        return;
      }

      const { filename, id, slug } = await res.json();
      setCurrentPostId(id);
      setCurrentSlug(slug);
      router.replace(`/editor/${slug}`);
      alert(`Exported to posts/${filename}`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed unexpectedly");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PostPageShell>
      <EditorBackButton type="button" onClick={handleBack}>
        ← Back
      </EditorBackButton>
      <PostHeaderSection>
        <PostTitleInput
          name="title"
          placeholder="[untitled blog]"
          autoComplete="off"
          aria-label="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Clouds width="5120" height="357" />
      </PostHeaderSection>
      <PostBodyColumn>
        <Tiptap onEditor={handleEditorReady} content={initialContent} />
      </PostBodyColumn>
      <ButtonWrapper>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export to JSON"}
        </Button>
      </ButtonWrapper>
    </PostPageShell>
  );
}

const EditorBackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: var(--page-padding-inline);
  z-index: 20;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--header) 50%, var(--accent));
  text-decoration: none;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0;
  width: fit-content;
  cursor: pointer;

  transition:
    color 0.15s ease,
    text-decoration 0.15s ease;

  &:hover {
    color: var(--header);
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-decoration-style: solid;
    text-underline-offset: 2px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 1rem;
  position: absolute;
  top: 2rem;
  right: var(--page-padding-inline);
  z-index: 20;
`;
