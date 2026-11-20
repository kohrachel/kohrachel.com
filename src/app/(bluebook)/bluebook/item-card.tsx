import Link from "next/link";
import type {
  ItemCardData,
  SearchResult,
} from "@/domain-types/bluebook/search";
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
import { Highlighted } from "./highlighted";
import { Star } from "./star";
import { Thumb } from "./thumb";

type CardItem = ItemCardData & { match?: SearchResult["match"] };

const TAPE_COLOURS = ["", "bb-tape--pink", "bb-tape--blue"];
// Card padding and text, in column widths of about 250px.
const PX = 1 / 250;

/** One saved thing in the grid: a picture card, or an index card without one. */
export function ItemCard({
  item,
  href,
  words = [],
}: {
  item: CardItem;
  href: string;
  words?: string[];
}) {
  const note = !item.thumbnailUrl;
  const meta = [item.creator, platformName(item.platform)]
    .filter(Boolean)
    .join(" · ");
  const lastLabel = item.isVideo ? "Last watched" : "Last watched or read";
  const tape =
    item.id % 4 === 0 ? (
      <span
        aria-hidden="true"
        className={[
          "bb-tape",
          note ? "bb-tape--corner" : "bb-tape--top",
          TAPE_COLOURS[item.id % 3],
          item.id % 8 === 0 ? "bb-tape--right" : "",
        ].join(" ")}
      />
    ) : null;
  const star = item.isFavorite && (
    <Star className="bb-star--pin" label="Favorite" />
  );
  const title = (
    <p className="bb-card__title">
      <Highlighted text={item.title} words={words} />
    </p>
  );
  const match = item.match && (
    <div className="bb-card__match">
      <p className="bb-card__match-text">
        <Highlighted text={item.match.sentence} words={words} />
      </p>
      <p className="bb-card__match-from">
        <time dateTime={isoDateAt(item.match.on, item.match.precision)}>
          {formatDateShort(item.match.on, item.match.precision)}
        </time>
      </p>
    </div>
  );

  if (note) {
    return (
      <Link href={href} className="bb-card bb-card--note">
        {tape}
        {star}
        {item.lastConsumed && (
          <time
            className="bb-card__date"
            dateTime={isoDateAt(
              item.lastConsumed.on,
              item.lastConsumed.precision,
            )}
            aria-label={`${lastLabel} ${formatDateLong(item.lastConsumed.on, item.lastConsumed.precision)}`}
          >
            {formatDateShort(
              item.lastConsumed.on,
              item.lastConsumed.precision,
            ).toUpperCase()}
          </time>
        )}
        {title}
        <p className="bb-card__meta">{meta}</p>
        {match}
      </Link>
    );
  }

  const frame = thumbnailFrame(item.size);
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
        {item.lastConsumed && (
          <time
            className="bb-stamp bb-stamp--photo"
            dateTime={isoDateAt(
              item.lastConsumed.on,
              item.lastConsumed.precision,
            )}
            aria-label={`${lastLabel} ${formatDateLong(item.lastConsumed.on, item.lastConsumed.precision)}`}
          >
            {formatPhotoStamp(
              item.lastConsumed.on,
              item.lastConsumed.precision,
            )}
          </time>
        )}
      </div>
      <div className="bb-card__body">
        {title}
        <p className="bb-card__meta">{meta}</p>
        {match}
      </div>
    </Link>
  );
}

/** A card's height in column widths, guessed before anything loads. */
export function estimateCardHeight(item: CardItem) {
  const match = item.match
    ? (31 + 20 * estimateLines(item.match.sentence, 30, 4)) * PX
    : 0;
  if (!item.thumbnailUrl) {
    return (87 + 24 * estimateLines(item.title, 16, 4)) * PX + match;
  }
  const frame = thumbnailFrame(item.size);
  return (
    1 / frame.value + (50 + 20 * estimateLines(item.title, 22, 3)) * PX + match
  );
}
