"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { SimpleEditor } from "@/components/tiptap/templates/simple/simple-editor";
import { PostHeader } from "@/components/post/post-header";
import { PostBody } from "@/components/post/post-body";
import { updatePost } from "@/server/posts/update";
import { discardDraft } from "@/server/posts/discard";
import type { Post } from "@/db/schema";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Delete02Icon,
  GitMergeIcon,
  SaveIcon,
  UndoIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { humanDate } from "@/lib/utils";

type Action = "save" | "publish" | "unpublish" | "discard" | "delete";

const ACTION_TEXT: Record<Action, { pending: string; done: string }> = {
  save: { pending: "Saving...", done: "Saved" },
  publish: { pending: "Publishing...", done: "Published" },
  unpublish: { pending: "Unpublishing...", done: "Unpublished" },
  discard: { pending: "Discarding...", done: "Changes discarded" },
  delete: { pending: "Deleting...", done: "Deleted" },
};

export type EditablePost = Pick<
  Post,
  "id" | "title" | "description" | "content" | "isPublished" | "publishedAt"
> & { hasDraft: boolean };

type PublishState = Pick<
  EditablePost,
  "isPublished" | "publishedAt" | "hasDraft"
>;

export function EditorWithSave({
  post,
  bannerUrl,
}: {
  post: EditablePost;
  bannerUrl: string;
}) {
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [publishState, setPublishState] = useState<PublishState>({
    isPublished: post.isPublished,
    publishedAt: post.publishedAt,
    hasDraft: post.hasDraft,
  });
  const [pending, setPending] = useState<Action | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean }>();
  const [confirming, setConfirming] = useState<"discard" | "delete" | null>(
    null,
  );

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const run = useCallback(async (action: Action, call: () => Promise<Post>) => {
    setPending(action);
    setMessage(undefined);
    try {
      const row = await call();
      setPublishState({
        isPublished: row.isPublished,
        publishedAt: row.publishedAt,
        hasDraft: row.draft !== null,
      });
      setMessage({ text: ACTION_TEXT[action].done });
      return row;
    } catch (error) {
      console.error(`${action} failed:`, error);
      setMessage({ text: "Something went wrong", error: true });
    } finally {
      setPending(null);
    }
  }, []);

  const currentFields = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return undefined;
    return {
      title,
      description,
      content: editor.getJSON() as Post["content"],
    };
  }, [title, description]);

  const handleSave = useCallback(() => {
    const fields = currentFields();
    if (!fields) return;
    run("save", () => updatePost({ id: post.id, patch: fields }));
  }, [currentFields, post.id, run]);

  // Publishes what's on screen, including edits that haven't been saved yet.
  const handlePublish = useCallback(() => {
    const fields = currentFields();
    if (!fields) return;
    run("publish", () =>
      updatePost({ id: post.id, patch: { ...fields, isPublished: true } }),
    );
  }, [currentFields, post.id, run]);

  const handleUnpublish = useCallback(() => {
    run("unpublish", () =>
      updatePost({ id: post.id, patch: { isPublished: false } }),
    );
  }, [post.id, run]);

  const handleDiscard = useCallback(async () => {
    if (confirming !== "discard") {
      setConfirming("discard");
      return;
    }
    setConfirming(null);
    const row = await run("discard", () => discardDraft(post.id));
    if (!row) return;
    setTitle(row.title);
    setDescription(row.description);
    editorRef.current?.commands.setContent(row.content);
  }, [confirming, post.id, run]);

  const handleDelete = useCallback(async () => {
    if (confirming !== "delete") {
      setConfirming("delete");
      return;
    }
    setConfirming(null);
    const row = await run("delete", () =>
      updatePost({ id: post.id, patch: { deletedAt: new Date() } }),
    );
    if (row) router.push("/editor");
  }, [confirming, post.id, run, router]);

  const { isPublished, publishedAt, hasDraft } = publishState;
  const statusText = isPublished
    ? hasDraft
      ? "Published · unpublished changes"
      : "Published"
    : "Draft";

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
        <div className="flex justify-end gap-2">
          <ActionButton
            label={confirming === "delete" ? "Click again to delete" : "Delete"}
            icon={Delete02Icon}
            onClick={handleDelete}
            onBlur={() => setConfirming(null)}
            disabled={pending !== null}
            variant="destructive"
          />
          {hasDraft && publishedAt !== null && (
            <ActionButton
              label={
                confirming === "discard"
                  ? "Click again to discard"
                  : "Discard changes"
              }
              icon={UndoIcon}
              onClick={handleDiscard}
              onBlur={() => setConfirming(null)}
              disabled={pending !== null}
            />
          )}
          {isPublished && (
            <ActionButton
              label="Unpublish"
              icon={ViewOffIcon}
              onClick={handleUnpublish}
              disabled={pending !== null}
            />
          )}
          <ActionButton
            label="Save"
            icon={SaveIcon}
            onClick={handleSave}
            disabled={pending !== null}
          />
          <ActionButton
            label={isPublished ? "Publish changes" : "Publish"}
            icon={GitMergeIcon}
            onClick={handlePublish}
            disabled={pending !== null}
            variant="default"
          />
        </div>
        <span
          className={`text-xs ${message?.error ? "text-destructive" : "text-[#f5f2e8]"}`}
        >
          {pending
            ? ACTION_TEXT[pending].pending
            : confirming
              ? `Click again to ${confirming}`
              : (message?.text ?? statusText)}
        </span>
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
        date={publishedAt ? humanDate(publishedAt) : "Not published yet"}
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

function ActionButton({
  label,
  icon,
  variant = "secondary",
  ...props
}: {
  label: string;
  icon: IconSvgElement;
  variant?: "default" | "secondary" | "destructive";
  onClick: () => void;
  onBlur?: () => void;
  disabled: boolean;
}) {
  return (
    <ButtonWithIcon
      variant={variant}
      size="lg"
      aria-label={label}
      title={label}
      className="h-9 px-2.5 text-sm sm:px-3"
      icon={icon}
      {...props}
    >
      <span className="hidden sm:inline">{label}</span>
    </ButtonWithIcon>
  );
}
