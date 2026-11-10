"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import type { Editor } from "@tiptap/react";
import { SimpleEditor } from "@/components/tiptap/templates/simple/simple-editor";
import { Input } from "@/components/ui/input";
import { updatePost } from "@/server/posts/update";
import type { Post } from "@/db/schema";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { buttonVariants } from "@/components/ui/button";
import { SaveIcon } from "@hugeicons/core-free-icons";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export type EditablePost = Pick<
  Post,
  "id" | "title" | "description" | "content"
>;

export function EditorWithSave({ post }: { post: EditablePost }) {
  const editorRef = useRef<Editor | null>(null);
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setStatus("saving");
    try {
      await updatePost({
        id: post.id,
        patch: {
          title,
          description,
          content: editor.getJSON() as Post["content"],
        },
      });
      setStatus("saved");
    } catch (error) {
      console.error("Save failed:", error);
      setStatus("error");
    }
  }, [post.id, title, description]);

  return (
    <div className="mx-auto w-full max-w-measure">
      <Link
        href="/editor"
        className={buttonVariants({ variant: "link", className: "px-0" })}
      >
        ← All posts
      </Link>
      <div className="flex items-start gap-3">
        <div className="mb-5 flex flex-1 flex-col">
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
        <div className="flex flex-col items-end gap-1">
          <ButtonWithIcon
            size="lg"
            onClick={handleSave}
            disabled={status === "saving"}
            className="h-9 px-3 text-sm align-center"
            icon={SaveIcon}
          >
            {status === "saving" ? "Saving..." : "Save"}
          </ButtonWithIcon>
          {status === "saved" && (
            <span className="text-xs text-muted-foreground">Saved</span>
          )}
          {status === "error" && (
            <span className="text-xs text-destructive">Save failed</span>
          )}
        </div>
      </div>
      <SimpleEditor
        onEditorReady={handleEditorReady}
        initialContent={post.content}
      />
    </div>
  );
}
