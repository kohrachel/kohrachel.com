"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { Editor } from "@tiptap/react";
import { SimpleEditor } from "@/components/tiptap/templates/simple/simple-editor";
import { PostHeader } from "@/components/post/post-header";
import { PostBody } from "@/components/post/post-body";
import { updatePost } from "@/server/posts/update";
import type { Post } from "@/db/schema";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { SaveIcon } from "@hugeicons/core-free-icons";
import { humanDate } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export type EditablePost = Pick<
  Post,
  "id" | "title" | "description" | "content" | "createdAt"
>;

export function EditorWithSave({
  post,
  bannerUrl,
}: {
  post: EditablePost;
  bannerUrl: string;
}) {
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

  // Clicking empty space in the body box (its padding, or below a short post)
  // puts the cursor at the end of the text, instead of only the text itself
  // being clickable.
  const focusEditorFromBox = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (
      target.closest(
        ".ProseMirror, .tiptap-toolbar, .simple-editor-search-and-replace",
      )
    )
      return;
    e.preventDefault();
    editorRef.current?.commands.focus("end");
  }, []);

  return (
    <>
      {/* Mirrors the back link's spot on the opposite corner of the banner. */}
      <div className="absolute right-6 top-6 z-20 flex flex-col items-end gap-1">
        <ButtonWithIcon
          variant="default"
          size="lg"
          onClick={handleSave}
          disabled={status === "saving"}
          className="h-9 px-3 text-sm align-center"
          icon={SaveIcon}
        >
          {status === "saving" ? "Saving..." : "Save"}
        </ButtonWithIcon>
        {status === "saved" && (
          <span className="text-xs text-[#f5f2e8]">Saved</span>
        )}
        {status === "error" && (
          <span className="text-xs text-destructive">Save failed</span>
        )}
      </div>

      <PostHeader
        bannerUrl={bannerUrl}
        title={
          <HeaderField
            value={title}
            onChange={setTitle}
            placeholder="[untitled]"
            label="Title"
          />
        }
        description={
          <HeaderField
            value={description}
            onChange={setDescription}
            placeholder="[no description]"
            label="Description"
          />
        }
        date={humanDate(post.createdAt)}
      />

      <PostBody onMouseDown={focusEditorFromBox}>
        <SimpleEditor
          onEditorReady={handleEditorReady}
          initialContent={post.content}
        />
      </PostBody>
    </>
  );
}

/**
 * A textarea that looks exactly like the header text it replaces: it inherits
 * the font, size, line height and colour of its slot, wraps like the text,
 * and grows to fit its content.
 */
function HeaderField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Fit the height to the content whenever it changes or the width does
  // (the header text sizes are viewport-relative).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    // Only refit on width changes; fit() itself changes the height.
    let width = el.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      // Titles and descriptions are single-line; Enter shouldn't add breaks.
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      placeholder={placeholder}
      aria-label={label}
      className="block w-full resize-none overflow-hidden bg-transparent text-center [font:inherit] tracking-[inherit] text-inherit outline-none placeholder:text-current/50"
    />
  );
}
