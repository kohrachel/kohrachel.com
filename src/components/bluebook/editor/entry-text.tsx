import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Link from "next/link";
import { ENTRY_EXTENSIONS } from "./extensions";

/**
 * An entry's text on the ruled sheet, or "No notes." without any. Mentions
 * link to their items and show each item's current title, or "[removed]"
 * once it's deleted.
 */
export function EntryText({
  content,
  edited,
  mentionedTitles,
  basePath,
}: {
  content: JSONContent | null;
  edited: boolean;
  mentionedTitles: Record<number, string | null>;
  basePath: string;
}) {
  if (!content) {
    return <p className="bb-entry__text bb-entry__text--empty">No notes.</p>;
  }
  return (
    <div
      className={`bb-entry__text bb-prose ${edited ? "bb-entry__text--edited" : ""}`}
    >
      {renderToReactElement({
        content,
        extensions: ENTRY_EXTENSIONS,
        options: {
          markMapping: {
            link: ({ mark, children }) => (
              <Link
                href={String(mark.attrs.href)}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {children}
              </Link>
            ),
          },
          nodeMapping: {
            mention: ({ node }) => {
              const id = Number(node.attrs.id);
              const title = mentionedTitles[id];
              return title ? (
                <Link href={`${basePath}/item/${id}`} className="bb-mention">
                  {title}
                </Link>
              ) : (
                <span className="bb-mention bb-mention--removed">
                  [removed]
                </span>
              );
            },
          },
        },
      })}
    </div>
  );
}
