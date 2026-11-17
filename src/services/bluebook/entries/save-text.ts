import "server-only";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { db } from "@/db";
import { entries, items, mentions } from "@/db/schema";
import type { SaveEntryTextResult } from "@/domain-types/bluebook/entries";
import {
  cleanEntryContent,
  collectMentions,
  entryPlainText,
  mentionedItemIds,
  relabelMentions,
} from "./content";

/**
 * The only code that writes entry text. In one transaction it saves the
 * text and its plain-text copy, replaces the entry's mentions with the ones
 * in the text, and marks the entry edited if it already had text that
 * changed. `changedItemIds` are the items whose pages show this: the
 * entry's own item and every item it mentions now or did before.
 */
export async function saveEntryTextService(
  entryId: number,
  json: unknown,
): Promise<SaveEntryTextResult> {
  const cleaned = cleanEntryContent(json);
  if (!cleaned) return { ok: false, error: "That text can't be saved." };

  return db.transaction(async (tx) => {
    const [entry] = await tx
      .select({ itemId: entries.itemId })
      .from(entries)
      .innerJoin(
        items,
        and(eq(items.id, entries.itemId), isNull(items.deletedAt)),
      )
      .where(eq(entries.id, entryId))
      .for("update", { of: entries });
    if (!entry) return { ok: false, error: "That entry doesn't exist." };

    const ids = mentionedItemIds(cleaned);
    const titles = new Map(
      ids.length
        ? (
            await tx
              .select({ id: items.id, title: items.title })
              .from(items)
              .where(inArray(items.id, ids))
          ).map(({ id, title }) => [id, title])
        : [],
    );
    const content: JSONContent = relabelMentions(cleaned, titles);
    const plainText = entryPlainText(content);

    await tx
      .update(entries)
      .set({
        content,
        plainText,
        updatedAt: sql`now()`,
        // Writing for the first time isn't an edit.
        contentEditedAt: sql`case
          when ${entries.plainText} <> '' and ${entries.content} <> ${JSON.stringify(content)}::jsonb
          then now() else ${entries.contentEditedAt} end`,
      })
      .where(eq(entries.id, entryId));

    const previous = await tx
      .delete(mentions)
      .where(eq(mentions.entryId, entryId))
      .returning({ targetItemId: mentions.targetItemId });
    const current = collectMentions(content, entry.itemId);
    if (current.length) {
      await tx
        .insert(mentions)
        .values(current.map((mention) => ({ entryId, ...mention })));
    }

    const changedItemIds = [
      ...new Set([
        entry.itemId,
        ...previous.map((mention) => mention.targetItemId),
        ...current.map((mention) => mention.targetItemId),
      ]),
    ];
    return { ok: true, itemId: entry.itemId, changedItemIds };
  });
}
