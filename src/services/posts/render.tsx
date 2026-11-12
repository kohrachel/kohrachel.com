import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Link from "next/link";
import { contentExtensions } from "@/components/post/content-extensions";

function warnUnhandled(kind: "node" | "mark", type: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`renderPostContent: no renderer for ${kind} "${type}"`);
  }
}

/** Like the editor, keeps an empty line or a trailing line break one line tall. */
function withTrailingBreaks(node: JSONContent): JSONContent {
  const content = node.content?.map(withTrailingBreaks);
  if (node.type !== "paragraph" && node.type !== "heading") {
    return content ? { ...node, content } : node;
  }
  const last = content?.at(-1);
  if (last && last.type !== "hardBreak") return { ...node, content };
  return { ...node, content: [...(content ?? []), { type: "hardBreak" }] };
}

export function renderPostContent(content: JSONContent) {
  return renderToReactElement({
    content: withTrailingBreaks(content),
    extensions: contentExtensions,
    options: {
      markMapping: {
        link: ({ mark, children }) => {
          const { href, target, rel, class: className } = mark.attrs;
          if (typeof href === "string" && /^\/(?!\/)/.test(href)) {
            return <Link href={href}>{children}</Link>;
          }
          return (
            <a
              href={href ?? undefined}
              target={target ?? undefined}
              rel={rel ?? undefined}
              className={className ?? undefined}
            >
              {children}
            </a>
          );
        },
      },
      nodeMapping: {
        horizontalRule: () => <hr />,
      },
      unhandledNode: ({ node, children }) => {
        warnUnhandled("node", node.type.name);
        return <>{children}</>;
      },
      unhandledMark: ({ mark, children }) => {
        warnUnhandled("mark", mark.type.name);
        return <>{children}</>;
      },
    },
  });
}
