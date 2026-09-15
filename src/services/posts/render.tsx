import type { JSONContent } from "@tiptap/core";
import type { CSSProperties, ReactNode } from "react";
import { assertExhaustive } from "@/lib/utils";

/** Wraps text/inline content in the marks applied to a text node. */
function applyMarks(
  node: JSONContent,
  children: ReactNode,
  key: number,
): ReactNode {
  const marks = node.marks ?? [];
  return marks.reduceRight<ReactNode>((acc, mark, i) => {
    const markKey = `${key}-mark-${i}`;
    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{acc}</strong>;
      case "italic":
        return <em key={markKey}>{acc}</em>;
      case "underline":
        return <u key={markKey}>{acc}</u>;
      case "strike":
        return <s key={markKey}>{acc}</s>;
      case "code":
        return <code key={markKey}>{acc}</code>;
      case "subscript":
        return <sub key={markKey}>{acc}</sub>;
      case "superscript":
        return <sup key={markKey}>{acc}</sup>;
      case "highlight": {
        const color = mark.attrs?.color as string | undefined;
        return (
          <mark
            key={markKey}
            style={color ? { backgroundColor: color } : undefined}
          >
            {acc}
          </mark>
        );
      }
      case "link": {
        const href = (mark.attrs?.href as string | undefined) ?? "#";
        const target = mark.attrs?.target as string | undefined;
        const rel = mark.attrs?.rel as string | undefined;
        return (
          <a key={markKey} href={href} target={target} rel={rel}>
            {acc}
          </a>
        );
      }
      case "textStyle":
        // Inline styling (color, font, etc.) carried in attrs.
        return (
          <span key={markKey} style={textStyleToCss(mark.attrs)}>
            {acc}
          </span>
        );
      default:
        return acc;
    }
  }, children);
}

function textStyleToCss(
  attrs: Record<string, unknown> | undefined,
): CSSProperties | undefined {
  if (!attrs) return undefined;
  const style: CSSProperties = {};
  if (typeof attrs.color === "string") style.color = attrs.color;
  if (typeof attrs.fontFamily === "string") style.fontFamily = attrs.fontFamily;
  if (typeof attrs.fontSize === "string") style.fontSize = attrs.fontSize;
  return Object.keys(style).length ? style : undefined;
}

function textAlignStyle(node: JSONContent): CSSProperties | undefined {
  const align = node.attrs?.textAlign as string | undefined;
  return align ? { textAlign: align as CSSProperties["textAlign"] } : undefined;
}

/** Renders the children array of a node. */
function renderChildren(node: JSONContent): ReactNode[] {
  return (node.content ?? []).map((child, i) => renderNode(child, i));
}

export function renderText(node: JSONContent): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(renderText).join("");
}

export function renderNode(node: JSONContent, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return applyMarks(node, node.text ?? "", key);

    case "paragraph":
      return (
        <p key={key} style={textAlignStyle(node)}>
          {renderChildren(node)}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number | undefined) ?? 1;
      const Tag = `h${Math.min(Math.max(level, 1), 6)}` as
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag key={key} style={textAlignStyle(node)}>
          {renderChildren(node)}
        </Tag>
      );
    }

    case "bulletList":
      return <ul key={key}>{renderChildren(node)}</ul>;

    case "orderedList": {
      const start = node.attrs?.start as number | undefined;
      return (
        <ol key={key} start={start && start !== 1 ? start : undefined}>
          {renderChildren(node)}
        </ol>
      );
    }

    case "listItem":
      return <li key={key}>{renderChildren(node)}</li>;

    case "taskList":
      return (
        <ul key={key} className="task-list" style={{ listStyle: "none" }}>
          {renderChildren(node)}
        </ul>
      );

    case "taskItem":
      return (
        <li key={key} className="task-item">
          <input type="checkbox" checked={!!node.attrs?.checked} readOnly />
          <span>{renderChildren(node)}</span>
        </li>
      );

    case "blockquote":
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;

    case "codeBlock": {
      const language = node.attrs?.language as string | undefined;
      return (
        <pre key={key}>
          <code className={language ? `language-${language}` : undefined}>
            {renderText(node)}
          </code>
        </pre>
      );
    }

    case "horizontalRule":
      return <hr key={key} />;

    case "hardBreak":
      return <br key={key} />;

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={(node.attrs?.src as string | undefined) ?? ""}
          alt={(node.attrs?.alt as string | undefined) ?? ""}
          title={node.attrs?.title as string | undefined}
        />
      );

    case "doc":
      return <div key={key}>{renderChildren(node)}</div>;

    default:
      if (node.type === undefined) return null;
      return assertExhaustive(node.type as never);
  }
}
