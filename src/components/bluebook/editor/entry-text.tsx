import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Link from "next/link";
import { ENTRY_EXTENSIONS } from "./extensions";

/**
 * An entry's text as HTML. Mentions link to their items and show each
 * item's current title, or "[removed]" once it's deleted.
 */
export function EntryText({
  content,
  mentionedTitles,
  basePath,
}: {
  content: JSONContent;
  mentionedTitles: Record<number, string | null>;
  basePath: string;
}) {
  return (
    <div className="entry-text">
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
                <Link href={`${basePath}/item/${id}`} className="mention">
                  @{title}
                </Link>
              ) : (
                <span className="mention mention-removed">[removed]</span>
              );
            },
          },
        },
      })}
    </div>
  );
}
