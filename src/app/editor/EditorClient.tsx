"use client";

import { useCallback, useRef, useState } from "react";
import { Editor } from "@tiptap/core";
import styled from "styled-components";
import Tiptap from "@components/TipTap";
import {
  PostBodyColumn,
  PostPageShell,
  PostTitleInput,
} from "@/lib/postPageLayout";
import { Button } from "@/components/Button";

export default function EditorClient() {
  const [title, setTitle] = useState("");
  const editorRef = useRef<Editor | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const handleExport = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    setExporting(true);
    try {
      const doc = editor.getJSON();
      const res = await fetch("/api/export-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, doc }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Export failed:", err);
        alert(`Export failed: ${err.error ?? res.statusText}`);
        return;
      }

      const { filename } = await res.json();
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
      <PostTitleInput
        name="title"
        placeholder="[untitled blog]"
        autoComplete="off"
        aria-label="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <PostBodyColumn>
        <Tiptap onEditor={handleEditorReady} />
      </PostBodyColumn>
      <ButtonRow>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export to JSON"}
        </Button>
      </ButtonRow>
    </PostPageShell>
  );
}

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;
