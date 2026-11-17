import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import { formatDate, formatDuration } from "@/lib/bluebook/format";
import { canWrite } from "@/server/auth/gate";
import { getItem } from "@/server/bluebook/items";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { embedFor, type Embed } from "@/services/bluebook/items/embed";
import { platformName } from "@/services/bluebook/links/platform";
import { EntryTextEditor } from "./entry-editor";
import { EntryText } from "./entry-text";
import { DeleteEntryButton, ItemTools } from "./owner-tools";

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
  const basePath = await bluebookBasePath();
  return (
    <>
      {embed ? (
        <Player embed={embed} title={item.title} />
      ) : (
        <LinkOutCard item={item} />
      )}
      <Details item={item} />
      <Suspense fallback={null}>
        <OwnerItemTools item={item} />
      </Suspense>
      <Entries item={item} basePath={basePath} />
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

function Entries({ item, basePath }: { item: ItemPageData; basePath: string }) {
  const { entries } = item;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Watched or read</h2>
      <ol className="flex flex-col gap-5">
        {entries.map((entry) => {
          const text = entry.plainText ? (
            <EntryText
              content={entry.content}
              mentionedTitles={item.mentionedTitles}
              basePath={basePath}
            />
          ) : null;
          return (
            <li key={entry.id} className="flex flex-col gap-1">
              <p className="text-sm text-stone-500">
                {formatDate(entry.consumedOn, entry.consumedPrecision)}
                {entry.contentEditedAt && (
                  <span
                    title={`Edited ${entry.contentEditedAt.toISOString().slice(0, 10)}`}
                  >
                    {" "}
                    · edited
                  </span>
                )}
              </p>
              <Suspense fallback={text}>
                <OwnerEntryText
                  entry={entry}
                  itemId={item.id}
                  basePath={basePath}
                >
                  {text}
                </OwnerEntryText>
              </Suspense>
              {entries.length > 1 && (
                <Suspense fallback={null}>
                  <OwnerOnly>
                    <DeleteEntryButton id={entry.id} />
                  </OwnerOnly>
                </Suspense>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** An entry's text, with the owner's button to write or edit it. */
async function OwnerEntryText({
  entry,
  itemId,
  basePath,
  children,
}: {
  entry: ItemPageData["entries"][number];
  itemId: number;
  basePath: string;
  children: React.ReactNode;
}) {
  if (!(await canWrite())) return children;
  return (
    <EntryTextEditor
      entryId={entry.id}
      itemId={itemId}
      content={entry.content}
      hasText={entry.plainText !== ""}
      basePath={basePath}
    >
      {children}
    </EntryTextEditor>
  );
}

/**
 * The owner's controls. They read the login cookie, so they load on their
 * own and the rest of the page stays cached.
 */
async function OwnerItemTools({ item }: { item: ItemPageData }) {
  if (!(await canWrite())) return null;
  return (
    <ItemTools
      item={{
        id: item.id,
        title: item.title,
        creator: item.creator,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        isFavorite: item.isFavorite,
      }}
      basePath={await bluebookBasePath()}
    />
  );
}

async function OwnerOnly({ children }: { children: React.ReactNode }) {
  return (await canWrite()) ? children : null;
}

function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
