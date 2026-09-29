"use client";

import { Post } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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

  function openPost(post: Post) {
    router.push(`/${post.id}`);
  }

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

    // `<n>` / `select <n>` / `open <n>` navigates to a post by index
    const selMatch = lower.match(/^(?:cat|select|open)?\s*(\d+)$/);
    if (selMatch) {
      const idx = Number(selMatch[1]) - 1;
      if (idx >= 0 && idx < posts.length) openPost(posts[idx]);
      else setError(`no document at index ${selMatch[1]}`);
      return;
    }

    setError("available commands: ls · open <name>");
  }

  return (
    <section
      className={`flex flex-col h-[70dvh] min-h-100 max-h-140 list-none text-start bg-[oklch(0.6937_0.0534_132.56)] text-black text-sm border-4 border-black/70 rounded-lg overflow-hidden font-mono ${className}`}
      data-not-typeset
      onClick={() => inputRef.current?.focus()}
    >
      {/* Window title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-black/70 bg-black text-[oklch(0.6937_0.0534_132.56)]">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full border border-black/40 bg-current opacity-90" />
          <span className="size-3 rounded-full border border-black/40 bg-current opacity-60" />
          <span className="size-3 rounded-full border border-black/40 bg-current opacity-40" />
        </span>
        <span className="mx-auto text-xs tracking-widest opacity-80">
          ~/rachelkoh — {posts.length} docs
        </span>
      </div>

      {/* List of available documents */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-3 py-1 text-xs tracking-wide border-b border-current/40 shrink-0 opacity-70">
          % ls ~/posts
        </div>
        {posts.length ? (
          <ul className="flex-1 overflow-auto">
            {posts.map((post, i) => (
              <li key={post.id} onMouseEnter={() => setSelected(i)}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPost(post);
                  }}
                  className={`flex w-full text-start items-start gap-2 cursor-pointer px-3 py-2 ${
                    i === selected
                      ? "bg-black text-[oklch(0.6937_0.0534_132.56)]"
                      : "hover:bg-black/10"
                  }`}
                >
                  <span className="opacity-60 shrink-0 text-lg">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex flex-col gap-1">
                    <span className="font-heading text-3xl leading-tight wrap-break-word whitespace-normal">
                      {post.title || "untitled"}
                    </span>
                    {post.description && (
                      <span className="font-sans italic text-lg opacity-80 wrap-break-word whitespace-normal">
                        {post.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
        className="flex items-center gap-2 h-9 px-3 border-t-2 border-black/70 bg-[oklch(0.6937_0.0534_132.56)] text-black shrink-0"
      >
        <span className="select-none shrink-0 font-bold">
          {error ?? "~/rachelkoh %"}
        </span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent outline-none border-none focus:ring-0 text-current caret-current"
          />
          {command === "" && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 w-2 bg-black animate-[terminalBlink_1s_steps(1)_infinite]"
            />
          )}
        </div>
      </form>
    </section>
  );
}
