import Link from "next/link";
import type { ItemCardData } from "@/domain-types/bluebook/search";
import { thumbnailFrame } from "@/lib/bluebook/thumbnail";
import { platformName } from "@/services/bluebook/links/platform";
import { Star } from "./star";
import { Thumb } from "./thumb";

const THUMB_HEIGHT = 120;

/** Every favorite in one sideways row, like photos pinned in a strip. */
export function FavoritesStrip({
  items,
  basePath,
}: {
  items: ItemCardData[];
  basePath: string;
}) {
  return (
    <section className="bb-favs" aria-labelledby="favorites-heading">
      <span
        aria-hidden="true"
        className="bb-tape bb-tape--pink bb-tape--right bb-tape--top"
      />
      <div className="bb-favs__head">
        <Star />
        <h2 className="bb-section-title" id="favorites-heading">
          Favorites
        </h2>
      </div>
      <div className="bb-favs__row">
        {items.map((item) => {
          const href = `${basePath}/item/${item.id}`;
          if (!item.thumbnailUrl) {
            return (
              <Link key={item.id} href={href} className="bb-fav bb-fav--note">
                <p className="bb-fav__title">{item.title}</p>
                <p className="bb-card__meta">{platformName(item.platform)}</p>
              </Link>
            );
          }
          const frame = thumbnailFrame(item.size);
          return (
            <Link
              key={item.id}
              href={href}
              className="bb-fav"
              title={item.title}
            >
              <div
                className={`bb-fav__thumb ${frame.crop === "cover" ? "" : `bb-thumb--${frame.crop}`}`}
                style={{ width: Math.round(THUMB_HEIGHT * frame.value) }}
              >
                <Thumb src={item.thumbnailUrl} />
              </div>
              <p className="bb-fav__title">{item.title}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
