import Link from "next/link";
import type { ExistingItem, PreviewResult } from "@/domain-types/bluebook/add";
import type {
  DetailField,
  DetailsResult,
  DetailsSource,
} from "@/domain-types/bluebook/details";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { formatDate, formatDuration } from "@/lib/bluebook/format";

const SOURCE_LABELS: Record<DetailsSource, string> = {
  youtube_api: "YouTube API",
  bilibili_api: "Bilibili API",
  wikipedia_api: "Wikipedia API",
  linkedin_embed: "LinkedIn embed",
  oembed: "oEmbed",
  page_meta: "page",
  share_text: "share text",
  link: "link",
};

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
      {result.details && <DetailsView result={result.details} />}
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

function DetailsView({ result }: { result: DetailsResult }) {
  const { details, sources } = result;
  const filled = Object.keys(sources).length > 0;
  if (!filled) {
    return (
      <p className="text-sm text-stone-500">
        Couldn&apos;t fetch any details. You&apos;ll fill them in.
      </p>
    );
  }

  const rows: [DetailField, string, string | null][] = [
    ["title", "Title", details.title],
    ["creator", "Creator", details.creator],
    [
      "publishedAt",
      "Published",
      details.publishedAt && formatDate(details.publishedAt),
    ],
    [
      "durationSeconds",
      "Length",
      details.durationSeconds ? formatDuration(details.durationSeconds) : null,
    ],
    [
      "width",
      "Size",
      details.width && details.height
        ? `${details.width}×${details.height}${details.height > details.width ? " (vertical)" : ""}`
        : null,
    ],
    ["description", "Description", details.description],
  ];

  return (
    <div className="flex flex-col gap-3 text-sm">
      {details.thumbnailUrl && (
        <img
          src={details.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-60 w-fit max-w-full rounded-md object-contain"
        />
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {rows.map(
          ([field, label, value]) =>
            value && (
              <div key={field} className="contents">
                <dt className="text-stone-500">{label}</dt>
                <dd className="whitespace-pre-line">
                  {value}{" "}
                  <span className="text-xs text-stone-400">
                    from {SOURCE_LABELS[sources[field]!]}
                  </span>
                </dd>
              </div>
            ),
        )}
      </dl>
    </div>
  );
}
