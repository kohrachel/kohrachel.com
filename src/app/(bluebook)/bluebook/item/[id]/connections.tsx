import Link from "next/link";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import {
  formatDateLong,
  formatDateShort,
  isoDateAt,
} from "@/lib/bluebook/format";

/** "Links out" and "Mentioned in", both built from `@` mentions. */
export function Connections({
  item,
  basePath,
}: {
  item: ItemPageData;
  basePath: string;
}) {
  const { linksOut, mentionedIn } = item;
  if (!linksOut.length && !mentionedIn.length) return null;
  return (
    <div className="bb-links">
      {linksOut.length > 0 && (
        <section className="bb-links__group">
          <h2 className="bb-section-title">Links out</h2>
          <ul className="bb-links__list">
            {linksOut.map((linked) => (
              <li key={linked.id}>
                <LinkRow id={linked.id} title={linked.title} basePath={basePath} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {mentionedIn.length > 0 && (
        <section className="bb-links__group">
          <h2 className="bb-section-title">Mentioned in</h2>
          <ul className="bb-links__list">
            {mentionedIn.map((mention, index) => (
              <li key={index}>
                <LinkRow
                  id={mention.itemId}
                  title={mention.title}
                  basePath={basePath}
                >
                  <div className="bb-linkrow__context">
                    <time
                      className="bb-stamp"
                      dateTime={isoDateAt(
                        mention.consumedOn,
                        mention.consumedPrecision,
                      )}
                      aria-label={formatDateLong(
                        mention.consumedOn,
                        mention.consumedPrecision,
                      )}
                    >
                      {formatDateShort(
                        mention.consumedOn,
                        mention.consumedPrecision,
                      ).toUpperCase()}
                    </time>
                    {mention.context && (
                      <span>
                        <Context text={mention.context} title={item.title} />
                      </span>
                    )}
                  </div>
                </LinkRow>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** A linked item, or "[removed]" once it's deleted. */
function LinkRow({
  id,
  title,
  basePath,
  children,
}: {
  id: number;
  title: string | null;
  basePath: string;
  children?: React.ReactNode;
}) {
  const pic = (
    <span aria-hidden="true" className="bb-linkrow__pic bb-linkrow__pic--note" />
  );
  if (title === null) {
    return (
      <div className="bb-linkrow bb-linkrow--removed">
        {pic}
        <p className="bb-linkrow__title">[removed]</p>
        <p className="bb-linkrow__meta">No longer in bluebook</p>
        {children}
      </div>
    );
  }
  return (
    <Link href={`${basePath}/item/${id}`} className="bb-linkrow">
      {pic}
      <p className="bb-linkrow__title">{title}</p>
      {children}
    </Link>
  );
}

/** The sentence around a mention, with this item's `@Title` shown as a mention. */
function Context({ text, title }: { text: string; title: string }) {
  const mention = `@${title}`;
  const at = text.indexOf(mention);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="bb-mention">{title}</span>
      {text.slice(at + mention.length)}
    </>
  );
}
