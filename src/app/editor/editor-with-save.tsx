"use client";

import { useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { SimpleEditor } from "@/components/tiptap/templates/simple/simple-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePost } from "@/server/posts/upsert";
import type { IPost } from "@/db/entities";

export function EditorWithSave() {
  const editorRef = useRef<Editor | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setIsSaving(true);
    try {
      await savePost({
        title: title || null,
        description: description || null,
        content: editor.getJSON() as IPost["content"],
      });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [title, description]);

  return (
    <div className="mx-auto w-full max-w-measure">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div className="flex flex-1 flex-col mb-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="[untitled]"
            className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-2 text-4xl font-bold shadow-none focus-visible:ring-0 md:text-4xl"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="[no description]"
            className="h-auto border-0 bg-transparent dark:bg-transparent px-0 py-1 text-lg text-muted-foreground shadow-none focus-visible:ring-0 md:text-lg"
          />
        </div>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-2 h-9 px-6 text-sm"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <SimpleEditor onEditorReady={handleEditorReady} />
    </div>
  );
}
