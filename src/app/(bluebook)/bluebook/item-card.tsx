import Link from "next/link";
import { Highlighted } from "@/components/bluebook/highlighted";
import type { SearchResult } from "@/domain-types/bluebook/search";
import {
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatPhotoStamp,
  isoDateAt,
} from "@/lib/bluebook/format";
import { estimateLines } from "@/lib/bluebook/masonry";
import { thumbnailFrame } from "@/lib/bluebook/thumbnail";
import { platformName } from "@/services/bluebook/links/platform";
import { Star } from "./star";
import { Thumb } from "./thumb";

const TAPE_COLOURS = ["", "bb-tape--pink", "bb-tape--blue"];
// Card padding and text, in column widths of about 250px.
const PX = 1 / 250;

/** One saved thing in the grid: a picture card, or an index card without one. */
export function ItemCard({
  item,
  href,
  words = [],
}: {
  item: SearchResult;
  href: string;
  words?: string[];
}) {
  const note = !item.thumbnailUrl;
  const meta = [item.creator, platformName(item.platform)]
    .filter(Boolean)
    .join(" · ");
  const lastLabel =
    item.videoSize || item.durationSeconds
      ? "Last watched"
      : "Last watched or read";
  const last = item.lastConsumed;
  const tape = item.id % 4 === 0 && (
    <span
      aria-hidden="true"
      className={[
        "bb-tape",
        note ? "bb-tape--corner" : "bb-tape--top",
        TAPE_COLOURS[item.id % 3],
        item.id % 8 === 0 ? "bb-tape--right" : "",
      ].join(" ")}
    />
  );
  const star = item.isFavorite && (
    <Star className="bb-star--pin" label="Favorite" />
  );
  const text = (
    <>
      <p className="bb-card__title">
        <Highlighted text={item.title} words={words} />
      </p>
      <p className="bb-card__meta">{meta}</p>
      {item.snippet && (
        <div className="bb-card__match">
          <p className="bb-card__match-text">
            <Highlighted text={item.snippet} words={words} />
          </p>
        </div>
      )}
    </>
  );

  if (note) {
    return (
      <Link href={href} className="bb-card bb-card--note">
        {tape}
        {star}
        {last && (
          <time
            className="bb-card__date"
            dateTime={isoDateAt(last.on, last.precision)}
            aria-label={`${lastLabel} ${formatDateLong(last.on, last.precision)}`}
          >
            {formatDateShort(last.on, last.precision).toUpperCase()}
          </time>
        )}
        {text}
      </Link>
    );
  }

  const frame = thumbnailFrame(item.videoSize);
  return (
    <Link href={href} className="bb-card">
      {tape}
      {star}
      <div
        className={`bb-card__thumb ${frame.crop === "cover" ? "" : `bb-thumb--${frame.crop}`}`}
        style={{ aspectRatio: frame.ratio }}
      >
        <Thumb src={item.thumbnailUrl!} />
        {item.durationSeconds && (
          <span className="bb-card__dur">
            {formatDuration(item.durationSeconds)}
          </span>
        )}
        {last && (
          <time
            className="bb-stamp bb-stamp--photo"
            dateTime={isoDateAt(last.on, last.precision)}
            aria-label={`${lastLabel} ${formatDateLong(last.on, last.precision)}`}
          >
            {formatPhotoStamp(last.on, last.precision)}
          </time>
        )}
      </div>
      <div className="bb-card__body">{text}</div>
    </Link>
  );
}

/** A card's height in column widths, guessed before anything loads. */
export function estimateCardHeight(item: SearchResult) {
  const snippet = item.snippet
    ? (11 + 20 * estimateLines(item.snippet, 30, 4)) * PX
    : 0;
  if (!item.thumbnailUrl) {
    return (87 + 24 * estimateLines(item.title, 16, 4)) * PX + snippet;
  }
  const frame = thumbnailFrame(item.videoSize);
  return (
    1 / frame.value +
    (50 + 20 * estimateLines(item.title, 22, 3)) * PX +
    snippet
  );
}
