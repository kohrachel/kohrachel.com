import { getSchema, type JSONContent } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { ENTRY_EXTENSIONS } from "@/components/bluebook/editor/extensions";
import {
  EMPTY_ENTRY_CONTENT,
  ENTRY_LINK,
  MAX_ENTRY_CONTENT_BYTES,
  MENTION_CONTEXT_MAX_LENGTH,
} from "@/domain-types/bluebook/entries";

const schema = getSchema(ENTRY_EXTENSIONS);
const SENTENCE_END = /[。！？!?.…\n]/;

/**
 * Entry text as it may be saved, or `null` if it isn't valid: too large, or
 * using anything entries don't allow. Links that aren't web addresses lose
 * their link, and a document with nothing in it is empty text.
 */
export function cleanEntryContent(json: unknown): JSONContent | null {
  if (JSON.stringify(json ?? null).length > MAX_ENTRY_CONTENT_BYTES) {
    return null;
  }
  const { type, content } = (json ?? {}) as JSONContent;
  if (type === "doc" && (content === undefined || content.length === 0)) {
    return EMPTY_ENTRY_CONTENT;
  }
  try {
    const node = Node.fromJSON(schema, json);
    if (node.type.name !== "doc") return null;
    node.check();
    return mapNodes(node.toJSON() as JSONContent, (child) => {
      if (!child.marks) return child;
      const { marks, ...rest } = child;
      const kept = marks.filter(
        (mark) =>
          mark.type !== "link" ||
          (typeof mark.attrs?.href === "string" &&
            ENTRY_LINK.test(mark.attrs.href)),
      );
      return kept.length ? { ...rest, marks: kept } : rest;
    });
  } catch {
    return null;
  }
}

/** The item ids mentioned, in order, without repeats. */
export function mentionedItemIds(content: JSONContent): number[] {
  const ids: number[] = [];
  mapNodes(content, (node) => {
    const id = mentionId(node);
    if (id !== null && !ids.includes(id)) ids.push(id);
    return node;
  });
  return ids;
}

/**
 * Gives each mention its item's current title. Mentions of items that
 * don't exist become plain `@label` text.
 */
export function relabelMentions(
  content: JSONContent,
  titles: Map<number, string>,
): JSONContent {
  return mapNodes(content, (node) => {
    const id = mentionId(node);
    if (node.type !== "mention") return node;
    const title = id === null ? undefined : titles.get(id);
    return title === undefined
      ? { type: "text", text: `@${node.attrs?.label ?? ""}` }
      : { ...node, attrs: { ...node.attrs, id: String(id), label: title } };
  });
}

/**
 * The plain-text copy, for search: a line per paragraph, list item or
 * quoted paragraph, with mentions as `@Title`.
 */
export function entryPlainText(content: JSONContent) {
  return [...textblocks(content)]
    .map((block) => inlineText(block).text)
    .join("\n")
    .trim();
}

/**
 * Each item mentioned, once, with the sentence around its first mention.
 * Mentions of `ownItemId` are left out.
 */
export function collectMentions(content: JSONContent, ownItemId: number) {
  const found = new Map<number, string>();
  for (const block of textblocks(content)) {
    const { text, mentions } = inlineText(block);
    for (const { id, at } of mentions) {
      if (id !== ownItemId && !found.has(id)) {
        found.set(id, sentenceAround(text, at));
      }
    }
  }
  return [...found].map(([targetItemId, context]) => ({
    targetItemId,
    context,
  }));
}

/** A paragraph's text, and where each mention starts in it. */
function inlineText(block: JSONContent) {
  let text = "";
  const mentions: { id: number; at: number }[] = [];
  for (const child of block.content ?? []) {
    const id = mentionId(child);
    if (id !== null) mentions.push({ id, at: text.length });
    text +=
      child.type === "text"
        ? (child.text ?? "")
        : child.type === "mention"
          ? `@${child.attrs?.label ?? ""}`
          : "\n";
  }
  return { text, mentions };
}

function sentenceAround(text: string, at: number) {
  let start = at;
  while (start > 0 && !SENTENCE_END.test(text[start - 1])) start--;
  let end = at;
  while (end < text.length && !SENTENCE_END.test(text[end])) end++;
  if (end < text.length && text[end] !== "\n") end++;
  const sentence = text.slice(start, end).trim();
  if (sentence.length <= MENTION_CONTEXT_MAX_LENGTH) return sentence;
  const from = Math.max(
    0,
    Math.min(
      at - start - MENTION_CONTEXT_MAX_LENGTH / 2,
      sentence.length - MENTION_CONTEXT_MAX_LENGTH,
    ),
  );
  const to = from + MENTION_CONTEXT_MAX_LENGTH;
  return `${from > 0 ? "…" : ""}${sentence.slice(from, to).trim()}${to < sentence.length ? "…" : ""}`;
}

function mentionId(node: JSONContent) {
  if (node.type !== "mention") return null;
  const id = Number(node.attrs?.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function* textblocks(node: JSONContent): Generator<JSONContent> {
  if (node.type === "paragraph") {
    yield node;
    return;
  }
  for (const child of node.content ?? []) yield* textblocks(child);
}

/** Rebuilds a document bottom-up, passing every node through `map`. */
function mapNodes(
  node: JSONContent,
  map: (node: JSONContent) => JSONContent,
): JSONContent {
  const content = node.content?.map((child) => mapNodes(child, map));
  return map(content ? { ...node, content } : node);
}
