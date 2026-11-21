import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import {
  formatDateLong,
  formatDateShort,
  formatDuration,
  isoDateAt,
  timesInWords,
} from "@/lib/bluebook/format";
import { canDeleteItem, canEditEntry } from "@/lib/bluebook/permissions";
import { sizeOf, thumbnailFrame } from "@/lib/bluebook/thumbnail";
import { currentUser } from "@/server/bluebook/auth/gate";
import { getItem } from "@/server/bluebook/items";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { embedFor, type Embed } from "@/services/bluebook/items/embed";
import {
  platformGroup,
  platformName,
} from "@/services/bluebook/links/platform";
import { Star } from "../../star";
import { Thumb } from "../../thumb";
import { Connections } from "./connections";
import { EntryTextEditor } from "./entry-editor";
import { EntryText } from "@/components/bluebook/editor";
import {
  AddEntryButton,
  DeleteEntryButton,
  EntryDateButton,
  ItemTools,
} from "./owner-tools";

type Props = PageProps<"/bluebook/item/[id]">;
type Entry = ItemPageData["entries"][number];

const READ_PLATFORMS: string[] = [
  CommonPlatform.Goodreads,
  CommonPlatform.Wikipedia,
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await loadItem(params);
  return { title: item ? `${item.title} · bluebook` : "bluebook" };
}

export default function ItemPage({ params }: Props) {
  return (
    <main className="bb-page bb-page--item">
      <Suspense fallback={<ItemLoading />}>
        <ItemContent params={params} />
      </Suspense>
    </main>
  );
}

function ItemLoading() {
  return (
    <div className="bb-item" aria-label="Loading">
      <div className="bb-item__main">
        <div className="bb-skel" style={{ aspectRatio: "16 / 9" }} />
        <div className="bb-skel" style={{ height: 72 }} />
      </div>
    </div>
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
  const vertical = !!embed && embed.height > embed.width;
  const verb = embed
    ? "Watched"
    : READ_PLATFORMS.includes(platformGroup(item.platform))
      ? "Read"
      : "Watched or read";

  const head = <ItemHead item={item} />;
  const log = <EntryLog item={item} basePath={basePath} verb={verb} />;
  const connections = <Connections item={item} basePath={basePath} />;
  const details = (
    <Details item={item} verb={verb} basePath={basePath} taped={!vertical} />
  );

  return (
    <>
      <Link href={basePath || "/"} className="bb-back">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        home
      </Link>
      {vertical ? (
        <div className="bb-item bb-item--short">
          <Player embed={embed} title={item.title} />
          <div className="bb-item__side">
            {head}
            {log}
            {connections}
            <div className="max-w-80">{details}</div>
          </div>
        </div>
      ) : (
        <div className="bb-item">
          <div className="bb-item__main">
            {embed ? (
              <Player embed={embed} title={item.title} />
            ) : (
              <LinkOutCard item={item} />
            )}
            {head}
            {log}
            {connections}
          </div>
          {details}
        </div>
      )}
    </>
  );
}

function Player({ embed, title }: { embed: Embed; title: string }) {
  const { src, width, height } = embed;
  return (
    <div
      className={`bb-player ${height > width ? "bb-player--vertical" : ""}`}
      style={{ "--r": `${width} / ${height}` } as React.CSSProperties}
    >
      <iframe
        src={src}
        title={title}
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function LinkOutCard({ item }: { item: ItemPageData }) {
  const thumbnailUrl = text(item.metadata.thumbnailUrl);
  const description = text(item.metadata.description);
  const platform = platformName(item.platform);
  const frame = thumbnailFrame(
    sizeOf(item.metadata.thumbnailWidth, item.metadata.thumbnailHeight) ??
      sizeOf(item.metadata.width, item.metadata.height),
  );
  return (
    <Link
      href={item.normalizedUrl}
      target="_blank"
      rel="noreferrer"
      className="bb-linkout"
    >
      {thumbnailUrl && (
        <div className="bb-linkout__pic">
          <span aria-hidden="true" className="bb-tape bb-tape--top" />
          <div
            className={`bb-linkout__frame ${frame.crop === "cover" ? "" : `bb-thumb--${frame.crop}`}`}
            style={{ aspectRatio: frame.ratio }}
          >
            <Thumb src={thumbnailUrl} />
          </div>
        </div>
      )}
      <div className="bb-linkout__body">
        <p className="bb-meta">{platform}</p>
        <p className="bb-item-title text-2xl/[30px]">{item.title}</p>
        {description && <p className="bb-linkout__desc">{description}</p>}
        <p className="bb-linkout__go">Open on {platform} ↗</p>
      </div>
    </Link>
  );
}

function ItemHead({ item }: { item: ItemPageData }) {
  const durationSeconds = Number(item.metadata.durationSeconds) || null;
  const meta = [
    platformName(item.platform),
    item.publishedAt && formatDateShort(item.publishedAt.toISOString(), "day"),
    durationSeconds && formatDuration(durationSeconds),
  ].filter(Boolean);
  return (
    <div className="bb-item__head">
      <div className="bb-item__title-row">
        <h1 className="bb-item-title">{item.title}</h1>
        <Suspense fallback={null}>
          <ViewerStar favoritedBy={item.favoritedBy} />
        </Suspense>
      </div>
      {item.creator && <p className="bb-item__creator">{item.creator}</p>}
      <p className="bb-meta">{meta.join(" · ")}</p>
    </div>
  );
}

function Details({
  item,
  verb,
  basePath,
  taped,
}: {
  item: ItemPageData;
  verb: string;
  basePath: string;
  taped: boolean;
}) {
  const durationSeconds = Number(item.metadata.durationSeconds) || null;
  return (
    <aside className="bb-details">
      {taped && (
        <span
          aria-hidden="true"
          className="bb-tape bb-tape--right bb-tape--top"
        />
      )}
      <dl>
        <dt>Platform</dt>
        <dd>{platformName(item.platform)}</dd>
        {item.publishedAt && (
          <>
            <dt>Published</dt>
            <dd>{formatDateShort(item.publishedAt.toISOString(), "day")}</dd>
          </>
        )}
        {durationSeconds && (
          <>
            <dt>Length</dt>
            <dd>{formatDuration(durationSeconds)}</dd>
          </>
        )}
        <dt>{verb}</dt>
        <dd>{timesInWords(item.entries.length)}</dd>
      </dl>
      <Link
        href={item.normalizedUrl}
        target="_blank"
        rel="noreferrer"
        className="bb-link text-sm"
      >
        Open original ↗
      </Link>
      <Suspense fallback={null}>
        <OwnerItemTools item={item} basePath={basePath} />
      </Suspense>
    </aside>
  );
}

function EntryLog({
  item,
  basePath,
  verb,
}: {
  item: ItemPageData;
  basePath: string;
  verb: string;
}) {
  const { entries } = item;
  return (
    <section className="bb-log">
      <div className="bb-log__head">
        <div className="bb-log__title">
          <h2 className="bb-section-title">
            {verb} {timesInWords(entries.length)}
          </h2>
        </div>
        <Suspense fallback={null}>
          <OwnerOnly>
            <AddEntryButton itemId={item.id} />
          </OwnerOnly>
        </Suspense>
      </div>
      <ol className="bb-sheet">
        {entries.map((entry) => {
          const text = (
            <EntryText
              content={entry.plainText ? entry.content : null}
              edited={!!entry.contentEditedAt}
              mentionedTitles={item.mentionedTitles}
              basePath={basePath}
            />
          );
          const stamp = (
            <time
              className="bb-stamp"
              dateTime={isoDateAt(entry.consumedOn, entry.consumedPrecision)}
              aria-label={formatDateLong(
                entry.consumedOn,
                entry.consumedPrecision,
              )}
            >
              {formatDateShort(
                entry.consumedOn,
                entry.consumedPrecision,
              ).toUpperCase()}
            </time>
          );
          return (
            <li key={entry.id} className="bb-entry">
              <div className="bb-entry__date">
                <Suspense fallback={stamp}>
                  <OwnerEntryDate entry={entry}>{stamp}</OwnerEntryDate>
                </Suspense>
                <p className="bb-entry__by">
                  {entry.author.displayName}
                  {item.favoritedBy.includes(entry.author.id) && (
                    <Star label="Favorite" />
                  )}
                </p>
              </div>
              <Suspense fallback={text}>
                <OwnerEntry
                  entry={entry}
                  itemId={item.id}
                  basePath={basePath}
                  deletable={entries.length > 1}
                >
                  {text}
                </OwnerEntry>
              </Suspense>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The viewer's own star, since favorites are per person. */
async function ViewerStar({ favoritedBy }: { favoritedBy: number[] }) {
  const user = await currentUser();
  return user && favoritedBy.includes(user.id) ? (
    <Star className="bb-star--lg" label="Your favorite" />
  ) : null;
}

async function canEdit(entry: Entry) {
  const user = await currentUser();
  return !!user && canEditEntry(user, entry.author.id);
}

/** An entry's date stamp, which its author (or an admin) can click to change. */
async function OwnerEntryDate({
  entry,
  children,
}: {
  entry: Entry;
  children: React.ReactNode;
}) {
  if (!(await canEdit(entry))) return children;
  return (
    <EntryDateButton
      id={entry.id}
      consumedOn={entry.consumedOn}
      consumedPrecision={entry.consumedPrecision}
    >
      {children}
    </EntryDateButton>
  );
}

/** An entry's text, with Edit · Delete under it for its author (or an admin). */
async function OwnerEntry({
  entry,
  itemId,
  basePath,
  deletable,
  children,
}: {
  entry: Entry;
  itemId: number;
  basePath: string;
  deletable: boolean;
  children: React.ReactNode;
}) {
  if (!(await canEdit(entry))) return children;
  return (
    <EntryTextEditor
      entryId={entry.id}
      itemId={itemId}
      content={entry.content}
      basePath={basePath}
      tools={
        deletable ? [<DeleteEntryButton key="delete" id={entry.id} />] : []
      }
    >
      {children}
    </EntryTextEditor>
  );
}

/**
 * The signed-in person's controls. They read the login cookie, so they load
 * on their own and the rest of the page stays cached.
 */
async function OwnerItemTools({
  item,
  basePath,
}: {
  item: ItemPageData;
  basePath: string;
}) {
  const user = await currentUser();
  if (!user) return null;
  return (
    <ItemTools
      item={{
        id: item.id,
        title: item.title,
        creator: item.creator,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        isFavorite: item.favoritedBy.includes(user.id),
      }}
      canDelete={canDeleteItem(
        user,
        item.entries.map((entry) => entry.author.id),
      )}
      basePath={basePath}
    />
  );
}

async function OwnerOnly({ children }: { children: React.ReactNode }) {
  return (await currentUser()) ? children : null;
}

function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
