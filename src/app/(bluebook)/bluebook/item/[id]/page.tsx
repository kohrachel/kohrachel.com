import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { formatDate, formatDuration } from "@/lib/bluebook/format";
import { getItem } from "@/server/bluebook/items";
import { embedFor, type Embed } from "@/services/bluebook/items/embed";
import { commonPlatformForHost } from "@/services/bluebook/links/normalize";

type Props = PageProps<"/bluebook/item/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await loadItem(params);
  return { title: item ? `${item.title} · bluebook` : "bluebook" };
}

export default function ItemPage({ params }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <ItemContent params={params} />
      </Suspense>
    </main>
  );
}

async function loadItem(params: Props["params"]) {
  const { id } = await params;
  const number = Number(id);
  return /^\d+$/.test(id) && Number.isSafeInteger(number)
    ? getItem(number)
    : null;
}

async function ItemContent({ params }: { params: Props["params"] }) {
  const item = await loadItem(params);
  if (!item) notFound();

  const embed = embedFor(item.normalizedUrl, item.metadata);
  return (
    <>
      {embed ? (
        <Player embed={embed} title={item.title} />
      ) : (
        <LinkOutCard item={item} />
      )}
      <Details item={item} />
      <Entries entries={item.entries} />
    </>
  );
}

function Player({ embed, title }: { embed: Embed; title: string }) {
  const { src, width, height } = embed;
  const vertical = height > width;
  return (
    <div
      className="mx-auto overflow-hidden rounded-md bg-black"
      style={{
        aspectRatio: `${width} / ${height}`,
        width: vertical
          ? `min(100%, calc(min(80vh, 640px) * ${width / height}))`
          : "100%",
      }}
    >
      <iframe
        src={src}
        title={title}
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="size-full"
      />
    </div>
  );
}

function LinkOutCard({ item }: { item: ItemPageData }) {
  const thumbnailUrl = text(item.metadata.thumbnailUrl);
  const description = text(item.metadata.description);
  return (
    <Link
      href={item.normalizedUrl}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-3 rounded-md border border-stone-300 p-4 hover:border-stone-500 sm:flex-row"
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-48 w-fit max-w-full rounded object-contain sm:max-w-60"
        />
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-medium">{item.title}</p>
        {description && (
          <p className="line-clamp-3 text-sm text-stone-600">{description}</p>
        )}
        <p className="text-sm text-stone-500">
          Open on {platformName(item.platform)} ↗
        </p>
      </div>
    </Link>
  );
}

function Details({ item }: { item: ItemPageData }) {
  const durationSeconds = Number(item.metadata.durationSeconds) || null;
  const facts = [
    platformName(item.platform),
    item.publishedAt && formatDate(item.publishedAt.toISOString()),
    durationSeconds && formatDuration(durationSeconds),
  ].filter(Boolean);

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">
        {item.title}
        {item.isFavorite && (
          <span className="ml-2 text-amber-500" title="Favorite">
            ★
          </span>
        )}
      </h1>
      {item.creator && <p>{item.creator}</p>}
      <p className="text-sm text-stone-500">
        {facts.join(" · ")} ·{" "}
        <Link
          href={item.normalizedUrl}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Original
        </Link>
      </p>
    </header>
  );
}

function Entries({ entries }: { entries: ItemPageData["entries"] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Watched or read</h2>
      <ol className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-1">
            <p className="text-sm text-stone-500">
              {formatDate(entry.consumedOn, entry.consumedPrecision)}
            </p>
            {entry.plainText && (
              <p className="whitespace-pre-line">{entry.plainText}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function platformName(platform: string) {
  const common = commonPlatformForHost(platform);
  return common ? COMMON_PLATFORM_NAMES[common] : platform;
}

function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
