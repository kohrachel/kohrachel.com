"use client";

import { Post } from "@/db/schema";
import { renderNode } from "@/services/posts/render";
import { useMemo, useRef, useState } from "react";

export default function PostSection({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  const [selected, setSelected] = useState<number>(0);
  const [command, setCommand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = posts[selected];
  const body = useMemo(
    () => (active?.content ? renderNode(active.content, 0) : null),
    [active],
  );

  function runCommand(raw: string) {
    const cmd = raw.trim().toLowerCase();
    setError(null);
    if (!cmd) return;

    // `open <n>` / `cat <n>` / just a number selects a post
    const match = cmd.match(/^(?:open|cat|select)?\s*(\d+)$/);
    if (match) {
      const idx = Number(match[1]) - 1;
      if (idx >= 0 && idx < posts.length) {
        setSelected(idx);
      } else {
        setError(`no document at index ${match[1]}`);
      }
    } else if (cmd === "ls" || cmd === "help") {
      setError("commands: ls · open <n> · <n>");
    } else {
      setError(`unknown command: ${raw.trim()}`);
    }
    setCommand("");
  }

  return (
    <section
      className={`grid grid-cols-9 grid-rows-[1fr_auto] list-none text-start bg-[oklch(0.6937_0.0534_132.56)] text-black text-sm p-4 gap-4 font-mono ${className}`}
      data-not-typeset
      onClick={() => inputRef.current?.focus()}
    >
      {/* Left panel — list of available documents */}
      <div className="col-span-2 flex flex-col border-2 border-black/70 bg-black text-[oklch(0.82_0.09_132.56)] overflow-hidden">
        <div className="px-2 py-1 text-xs uppercase tracking-widest border-b border-current/40 shrink-0">
          documents
        </div>
        <ul className="flex-1 overflow-auto">
          {posts.map((post, i) => (
            <li
              key={post.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(i);
                inputRef.current?.focus();
              }}
              className={`cursor-pointer truncate px-2 py-1 ${
                i === selected
                  ? "bg-[oklch(0.82_0.09_132.56)] text-black"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {post.title || "untitled"}
            </li>
          ))}
        </ul>
      </div>

      {/* Right pane — selected document contents */}
      <div className="col-span-7 flex flex-col border-2 border-black/70 bg-black text-[oklch(0.82_0.09_132.56)] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1 text-xs uppercase tracking-widest border-b border-current/40 shrink-0">
          <span>{active ? `doc ${selected + 1}/${posts.length}` : "—"}</span>
          <span className="opacity-60">{active?.viewCount ?? 0} views</span>
        </div>
        {active ? (
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <h2 className="text-lg font-bold uppercase tracking-wide leading-tight">
              {active.title || "untitled"}
            </h2>
            {active.description && (
              <p className="opacity-70 italic">{active.description}</p>
            )}
            <div className="border-t border-current/30 pt-3 leading-relaxed [&_p]:mb-3 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-current/40 [&_blockquote]:pl-3 [&_blockquote]:opacity-80">
              {body ?? "[ empty document ]"}
            </div>
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
        className="col-span-9 flex items-center gap-2 h-9 px-3 border-2 border-black/70 bg-black text-[oklch(0.82_0.09_132.56)]"
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
          placeholder="type a command… (ls, open <n>)"
          className="w-full bg-transparent outline-none border-none focus:ring-0 placeholder:text-current/40 text-current caret-current"
        />
      </form>
    </section>
  );
}
