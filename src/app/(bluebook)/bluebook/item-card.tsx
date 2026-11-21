import Link from "next/link";
import type { SearchResult } from "@/domain-types/bluebook/search";
import {
  formatDateLong,
  formatDateShort,
  isoDateAt,
} from "@/lib/bluebook/format";
import { estimateLines } from "@/lib/bluebook/masonry";
import { platformName } from "@/services/bluebook/links/platform";
import { Highlighted } from "@/components/bluebook/highlighted";
import { Star } from "./star";

const TAPE_COLOURS = ["", "bb-tape--pink", "bb-tape--blue"];
// Card padding and text, in column widths of about 250px.
const PX = 1 / 250;

/** One saved thing in the grid, as an index card. */
export function ItemCard({
  item,
  href,
  words = [],
}: {
  item: SearchResult;
  href: string;
  words?: string[];
}) {
  const meta = [item.creator, platformName(item.platform)]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={href} className="bb-card bb-card--note">
      {item.id % 4 === 0 && (
        <span
          aria-hidden="true"
          className={[
            "bb-tape bb-tape--corner",
            TAPE_COLOURS[item.id % 3],
            item.id % 8 === 0 ? "bb-tape--right" : "",
          ].join(" ")}
        />
      )}
      {item.isFavorite && <Star className="bb-star--pin" label="Favorite" />}
      {item.lastConsumed && (
        <time
          className="bb-card__date"
          dateTime={isoDateAt(item.lastConsumed.on, item.lastConsumed.precision)}
          aria-label={`Last watched or read ${formatDateLong(item.lastConsumed.on, item.lastConsumed.precision)}`}
        >
          {formatDateShort(
            item.lastConsumed.on,
            item.lastConsumed.precision,
          ).toUpperCase()}
        </time>
      )}
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
    </Link>
  );
}

/** A card's height in column widths, guessed before it renders. */
export function estimateCardHeight(item: SearchResult) {
  const snippet = item.snippet
    ? (11 + 20 * estimateLines(item.snippet, 30, 4)) * PX
    : 0;
  return (87 + 24 * estimateLines(item.title, 16, 4)) * PX + snippet;
}
