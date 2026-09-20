"use client";

import { Post } from "@/db/schema";
import { renderNode } from "@/services/posts/render";
import { humanDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function PostSection({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number>(0);
  const [command, setCommand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = posts[selected];

  function openPost(post: Post) {
    router.push(`/${post.id}`);
  }
  const body = useMemo(
    () => (active?.content ? renderNode(active.content, 0) : null),
    [active],
  );

  function findPost(term: string): Post | undefined {
    const t = term.trim().toLowerCase();
    if (/^\d+$/.test(t)) return posts[Number(t) - 1];
    return (
      posts.find((p) => p.title.toLowerCase() === t) ??
      posts.find((p) => p.title.toLowerCase().includes(t))
    );
  }

  function runCommand(raw: string) {
    const cmd = raw.trim();
    const lower = cmd.toLowerCase();
    setError(null);
    if (!cmd) return;
    setCommand("");

    // `open <name|n>` navigates to the full post page
    const openMatch = lower.match(/^open\s+(.+)$/);
    if (openMatch) {
      const post = findPost(openMatch[1]);
      if (post) openPost(post);
      else setError(`no document matching "${openMatch[1].trim()}"`);
      return;
    }

    // `<n>` / `select <n>` / `cat <n>` previews a post in the right pane
    const selMatch = lower.match(/^(?:cat|select)?\s*(\d+)$/);
    if (selMatch) {
      const idx = Number(selMatch[1]) - 1;
      if (idx >= 0 && idx < posts.length) setSelected(idx);
      else setError(`no document at index ${selMatch[1]}`);
      return;
    }

    if (lower === "ls" || lower === "help") {
      setError("commands: ls · <n> (preview) · open <name> (full post)");
      return;
    }

    setError(`unknown command: ${cmd}`);
  }

  return (
    <section
      className={`grid grid-cols-9 grid-rows-[1fr_auto] max-h-140 list-none text-start bg-[oklch(0.6937_0.0534_132.56)] text-black text-sm border-4 border-black/70 font-mono ${className}`}
      data-not-typeset
      onClick={() => inputRef.current?.focus()}
    >
      {/* Left panel — list of available documents */}
      <div className="col-span-2 min-h-0 flex flex-col border-r-2 border-black/70 bg-[oklch(0.6937_0.0534_132.56)] text-black overflow-hidden">
        <div className="px-2 py-1 text-xs uppercase tracking-widest border-b border-current/40 shrink-0">
          documents
        </div>
        <ul className="flex-1 overflow-auto">
          {posts.map((post, i) => (
            <li key={post.id} onMouseEnter={() => setSelected(i)}>
              <Link
                href={`/${post.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`block cursor-pointer truncate px-2 py-1 ${
                  i === selected
                    ? "bg-black text-[oklch(0.6937_0.0534_132.56)]"
                    : "hover:bg-black/10"
                }`}
              >
                <span className="opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {post.title || "untitled"}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right pane — selected document contents */}
      <div className="col-span-7 min-h-0 flex flex-col bg-[oklch(0.6937_0.0534_132.56)] text-black overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1 text-xs uppercase tracking-widest border-b border-current/40 shrink-0">
          <span>{active ? `doc ${selected + 1}/${posts.length}` : "—"}</span>
          <span className="opacity-60">
            {active ? humanDate(active.createdAt) : ""}
          </span>
        </div>
        {active ? (
          <div
            className="flex-1 min-h-0 flex flex-col cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              openPost(active);
            }}
          >
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <h2 className="text-lg font-bold uppercase tracking-wide leading-tight font-lcd">
                {active.title || "untitled"}
              </h2>
              {active.description && (
                <p className="opacity-70 italic">{active.description}</p>
              )}
              <div className="border-t border-current/30 pt-3 leading-relaxed [&_p]:mb-3 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-current/40 [&_blockquote]:pl-3 [&_blockquote]:opacity-80">
                {body ?? "[ empty document ]"}
              </div>
            </div>
            <Link
              href={`/${active.id}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 border-t-2 border-black/70 bg-background/90 text-[oklch(0.6937_0.0534_132.56)] px-4 py-2 text-xs uppercase tracking-widest hover:bg-black"
            >
              view full post → &nbsp;
              <span className="opacity-60 normal-case tracking-normal">
                or type “open {active.title || active.id}”
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex-1 grid place-items-center opacity-60">
            no documents available
          </div>
        )}
      </div>

      {/* Bottom — command input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(command);
        }}
        className="col-span-9 flex items-center gap-2 h-9 px-3 border-t-2 border-black/70 bg-[oklch(0.6937_0.0534_132.56)] text-black"
      >
        <span className="select-none shrink-0">
          {error ? `! ${error}` : ">"}
        </span>
        <input
          ref={inputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="available commands (ls · open <name>)"
          className="w-full bg-transparent outline-none border-none focus:ring-0 placeholder:text-current/40 text-current caret-current"
        />
      </form>
    </section>
  );
}
