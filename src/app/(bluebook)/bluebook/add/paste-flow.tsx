"use client";

import { useState, useTransition } from "react";
import { previewLink } from "@/server/bluebook/add";
import type { PreviewResult } from "@/domain-types/bluebook/add";
import { PreviewView } from "./preview-view";

export function PasteFlow() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function preview() {
    if (!text.trim() || pending) return;
    startTransition(async () => {
      try {
        setResult(await previewLink({ text }));
        setFailed(false);
      } catch {
        setResult(null);
        setFailed(true);
      }
    });
  }

  function clear() {
    setText("");
    setResult(null);
    setFailed(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          preview();
        }}
      >
        <label htmlFor="paste" className="text-sm text-stone-500">
          Paste a link or share text
        </label>
        <textarea
          id="paste"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              preview();
            }
          }}
          rows={3}
          maxLength={5000}
          required
          autoFocus
          className="w-full resize-y rounded-md border border-stone-300 bg-transparent p-2 text-base outline-none focus:border-stone-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-md bg-stone-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Fetching…" : "Add"}
          </button>
          {(text || result) && (
            <button
              type="button"
              onClick={clear}
              disabled={pending}
              className="rounded-md px-3 py-1.5 text-sm text-stone-600 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {failed && (
        <p role="alert" className="text-sm text-red-700">
          Something went wrong. Try again, or check you&apos;re still logged in.
        </p>
      )}
      {result && !pending && <PreviewView result={result} />}
    </div>
  );
}
