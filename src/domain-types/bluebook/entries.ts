import type { JSONContent } from "@tiptap/core";

export const EMPTY_ENTRY_CONTENT: JSONContent = { type: "doc", content: [] };

/** Entry text larger than this, as JSON, is refused. */
export const MAX_ENTRY_CONTENT_BYTES = 200_000;
/** The sentence kept around a mention is cut to this many characters. */
export const MENTION_CONTEXT_MAX_LENGTH = 300;

/** Links in entry text must be web addresses. */
export const ENTRY_LINK = /^https?:\/\//i;

/** How many items the `@` picker offers. */
export const MENTION_PICKER_LIMIT = 8;

export type MentionTarget = { id: number; title: string; platform: string };

export type SaveEntryTextResult =
  | { ok: true; itemId: number; changedItemIds: number[] }
  | { ok: false; error: string };
