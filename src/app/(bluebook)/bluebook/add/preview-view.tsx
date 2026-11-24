import Link from "next/link";
import type { ExistingItem, PreviewResult } from "@/domain-types/bluebook/add";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { formatDateShort } from "@/lib/bluebook/format";
import { Notice } from "../notice";

/** What the preview found that you should know before saving. */
export function PreviewView({
  result,
  basePath,
}: {
  result: PreviewResult;
  basePath: string;
}) {
  if (!result.ok) return <Notice kind="error" title={problemMessage(result)} />;
  if (!result.existing) return null;
  return <ExistingView existing={result.existing} basePath={basePath} />;
}

/** The platform's name, or the link's site for anything else. */
export function platformLabel(preview: Extract<PreviewResult, { ok: true }>) {
  return preview.commonPlatform
    ? COMMON_PLATFORM_NAMES[preview.commonPlatform]
    : new URL(preview.normalizedUrl).hostname.replace(/^www\./, "");
}

function problemMessage(result: Extract<PreviewResult, { ok: false }>) {
  switch (result.reason) {
    case "no_link":
      return "No link found in that text.";
    case "short_link_failed":
      return "Couldn't open that short link. Open it in your browser and copy the link from the address bar instead.";
    case "unsupported_page": {
      const name = COMMON_PLATFORM_NAMES[result.commonPlatform];
      return `That's a ${name} link, but not a ${name} page bluebook can save.`;
    }
  }
}

function ExistingView({
  existing,
  basePath,
}: {
  existing: ExistingItem;
  basePath: string;
}) {
  const entries = `${existing.entryCount} ${existing.entryCount === 1 ? "entry" : "entries"}`;
  const last = existing.lastConsumed
    ? `Last ${formatDateShort(existing.lastConsumed.on, existing.lastConsumed.precision)}. `
    : "";

  return (
    <Notice
      kind="info"
      title={`${existing.isDeleted ? "This was removed from bluebook" : "Already in bluebook"} · ${entries}`}
    >
      {existing.isDeleted ? (
        <>
          {existing.title}. {last}Saving brings it back with its entries.
        </>
      ) : (
        <>
          <Link href={`${basePath}/item/${existing.id}`} className="bb-link">
            {existing.title}
          </Link>
          . {last}Saving adds your entry to it.
        </>
      )}
    </Notice>
  );
}
