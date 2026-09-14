import type { JSONContent } from "@tiptap/core";
import { assertExhaustive } from "@/lib/utils";

export function renderText(node: JSONContent): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(renderText).join("");
}

export function renderNode(node: JSONContent, key: number) {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderText(node)}</p>;
    default:
      if (node.type === undefined) return null;
      return assertExhaustive(node.type as never);
  }
}
