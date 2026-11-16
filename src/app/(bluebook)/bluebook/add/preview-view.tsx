import Link from "next/link";
import type { ExistingItem, PreviewResult } from "@/domain-types/bluebook/add";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { formatDate } from "@/lib/bluebook/format";

export function PreviewView({ result }: { result: PreviewResult }) {
  if (!result.ok) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {problemMessage(result)}
      </p>
    );
  }

  const platform = result.commonPlatform
    ? COMMON_PLATFORM_NAMES[result.commonPlatform]
    : new URL(result.normalizedUrl).hostname.replace(/^www\./, "");

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm break-all text-stone-500">
        {platform} ·{" "}
        <Link
          href={result.normalizedUrl}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {result.normalizedUrl}
        </Link>
      </p>
      {result.existing && <ExistingView existing={result.existing} />}
    </section>
  );
}

function problemMessage(result: Extract<PreviewResult, { ok: false }>) {
  switch (result.reason) {
    case "no_link":
      return "No link found in that text.";
    case "short_link_failed":
      return "Couldn't open that short link. Try the full link instead.";
    case "unsupported_page": {
      const name = COMMON_PLATFORM_NAMES[result.commonPlatform];
      return `That's a ${name} link, but not a ${name} page bluebook can save.`;
    }
  }
}

function ExistingView({ existing }: { existing: ExistingItem }) {
  const entries = `${existing.entryCount} ${existing.entryCount === 1 ? "entry" : "entries"}`;
  const last = existing.lastConsumed
    ? `, last ${formatDate(existing.lastConsumed.on, existing.lastConsumed.precision)}`
    : "";

  return (
    <div className="rounded-md border border-stone-300 p-3 text-sm">
      <p className="font-medium">
        {existing.isDeleted
          ? "You removed this before"
          : "You already have this"}
      </p>
      <p>
        {existing.title}
        {existing.creator && ` · ${existing.creator}`}
      </p>
      <p className="text-stone-500">
        {entries}
        {last}.{" "}
        {existing.isDeleted
          ? "Saving brings it back with them."
          : "Saving adds a new entry."}
      </p>
    </div>
  );
}
