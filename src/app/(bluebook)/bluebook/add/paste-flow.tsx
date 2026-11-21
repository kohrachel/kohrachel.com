"use client";

import { MagicWand01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PreviewResult } from "@/domain-types/bluebook/add";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { thumbnailFrame } from "@/lib/bluebook/thumbnail";
import { previewLink } from "@/server/bluebook/add";
import { Notice } from "../notice";
import { buttonClass, quietButtonClass } from "../styles";
import { Thumb } from "../thumb";
import {
  ConfirmForm,
  initialDraft,
  type Draft,
  type Saved,
} from "./confirm-form";
import { platformLabel, PreviewView } from "./preview-view";

const PLATFORMS = Object.values(COMMON_PLATFORM_NAMES);
const SITES = `${PLATFORMS.slice(0, -1).join(", ")} and ${PLATFORMS.at(-1)}`;

/** `basePath` is where bluebook's pages start on this host. */
export function PasteFlow({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [draft, setDraft] = useState<Draft>({ title: "", creator: "" });
  const [failed, setFailed] = useState(false);
  // Remounts the confirm form for each preview, so it starts from that one.
  const [previewCount, setPreviewCount] = useState(0);
  const [pending, startTransition] = useTransition();

  function preview() {
    if (!text.trim() || pending) return;
    startTransition(async () => {
      try {
        const next = await previewLink({ text });
        setResult(next);
        setDraft(next.ok ? initialDraft(next) : { title: "", creator: "" });
        setPreviewCount((count) => count + 1);
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
    setDraft({ title: "", creator: "" });
    setFailed(false);
  }

  function onSaved({ itemId }: Saved) {
    router.push(`${basePath}/item/${itemId}`);
  }

  const ready = result?.ok && !pending ? result : null;
  const filled = ready?.details ? Object.keys(ready.details.sources).length : 0;
  const details = ready?.details?.details;

  return (
    <div className="bb-add">
      <div className="bb-stack gap-6">
        <section className="bb-autofill">
          <span
            aria-hidden="true"
            className="bb-tape bb-tape--pink bb-tape--corner"
          />
          <h2 className="bb-section-title">Start with a link</h2>
          <p className="bb-autofill__sub">
            Paste a link or share text and bluebook fills in the title, creator,
            date and thumbnail.
          </p>
          <form
            className="bb-stack gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              preview();
            }}
          >
            <label htmlFor="paste" className="bb-sr">
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
              rows={2}
              maxLength={5000}
              required
              autoFocus
              placeholder="https://…"
              className="bb-input"
            />
            <div className="bb-row">
              <button
                type="submit"
                disabled={pending || !text.trim()}
                className={buttonClass}
              >
                <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={1.8} />
                {pending ? "Filling in…" : "Autofill"}
              </button>
              <span className="bb-kbd">
                <kbd>⌘</kbd> <kbd>Enter</kbd>
              </span>
              {(text || result) && (
                <button
                  type="button"
                  onClick={clear}
                  disabled={pending}
                  className={quietButtonClass}
                >
                  Clear
                </button>
              )}
              {filled > 0 && ready && (
                <p className="bb-autofill__done" aria-live="polite">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                  Filled in {filled} {filled === 1 ? "detail" : "details"} from{" "}
                  {platformLabel(ready)}
                </p>
              )}
            </div>
          </form>
          <p className="bb-autofill__sites">
            Best with {SITES}. Most other sites work too.
          </p>
        </section>

        {failed && (
          <Notice
            kind="error"
            title="Something went wrong. Try again, or check you're still logged in."
          />
        )}
        {result && !pending && (
          <PreviewView result={result} basePath={basePath} />
        )}
        {ready && (
          <ConfirmForm
            key={previewCount}
            preview={ready}
            onSaved={onSaved}
            onDraftChange={setDraft}
            basePath={basePath}
          />
        )}
      </div>

      <div className="bb-add__side">
        <Polaroid
          thumbnailUrl={details?.thumbnailUrl ?? null}
          size={
            details?.width && details.height
              ? { width: details.width, height: details.height }
              : null
          }
          title={draft.title.trim()}
          meta={[draft.creator.trim(), ready && platformLabel(ready)]
            .filter(Boolean)
            .join(" · ")}
        />
      </div>
    </div>
  );
}

/** How the saved thing will look: its picture and title, pinned up. */
function Polaroid({
  thumbnailUrl,
  size,
  title,
  meta,
}: {
  thumbnailUrl: string | null;
  size: { width: number; height: number } | null;
  title: string;
  meta: string;
}) {
  const frame = thumbnailFrame(size);
  return (
    <figure
      className="bb-polaroid"
      style={
        thumbnailUrl
          ? ({ "--r": frame.ratio } as React.CSSProperties)
          : undefined
      }
    >
      {thumbnailUrl ? (
        <>
          <span
            aria-hidden="true"
            className="bb-tape bb-tape--blue bb-tape--top"
          />
          <div
            className={`bb-polaroid__pic ${frame.crop === "cover" ? "" : `bb-thumb--${frame.crop}`}`}
          >
            <Thumb key={thumbnailUrl} src={thumbnailUrl} />
          </div>
        </>
      ) : (
        <div className="bb-polaroid__pic bb-polaroid__pic--empty">
          The thumbnail shows up here
        </div>
      )}
      <figcaption
        className={`bb-polaroid__cap ${title ? "" : "text-ink-muted"}`}
      >
        {title || "Untitled"}
        {meta && <small>{meta}</small>}
      </figcaption>
    </figure>
  );
}
