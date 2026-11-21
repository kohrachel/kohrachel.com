import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, items } from "@/db/schema";
import type { ParsedSaveInput, SaveResult } from "@/domain-types/bluebook/add";
import { startOfPeriod } from "@/lib/bluebook/dates";
import { canDeleteItem, type Actor } from "@/lib/bluebook/permissions";
import { setUserFavorite } from "@/services/bluebook/items/favorites";
import { itemAuthorIds } from "@/services/bluebook/items/edit";
import { normalizeUrl } from "@/services/bluebook/links/normalize";
import { isPublicHttpUrl } from "@/services/bluebook/links/resolve";

/**
 * Saves a confirmed link, in one transaction, as one of:
 * - `created`: a new item and its first entry.
 * - `added_entry`: a new entry on the item that already has this link. The
 *   item's own details are left as they are.
 * - `restored`: the deleted item that had this link comes back, with the
 *   form's details and its old entries, plus a new entry. Metadata fetched
 *   again replaces the old values; anything not fetched again is kept. Only
 *   someone who could have deleted it can bring it back.
 *
 * The new entry is the actor's, and the favorite box stars or unstars the
 * item for the actor.
 */
export async function saveLinkService(
  actor: Actor,
  input: ParsedSaveInput,
): Promise<SaveResult> {
  if (!isPublicHttpUrl(new URL(input.resolvedUrl))) {
    return { ok: false, error: "That link can't be saved." };
  }
  // Computed again here, so the duplicate key never comes from the browser.
  const normalized = normalizeUrl(input.resolvedUrl);
  if (!normalized.ok) {
    return { ok: false, error: "That kind of page can't be saved." };
  }
  const { normalizedUrl } = normalized;

  const fields = {
    url: input.url,
    title: input.title,
    creator: input.creator,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    metadata: withoutEmpty(input.metadata),
  };

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(items)
      .values({ ...fields, normalizedUrl })
      .onConflictDoNothing({ target: items.normalizedUrl })
      .returning({ id: items.id });

    const reused = created
      ? { itemId: created.id, outcome: "created" as const }
      : await reuseItem(tx, actor, normalizedUrl, fields);
    if (!reused) {
      return {
        ok: false,
        error:
          "This was deleted, and others had logged it, so only the owner or an admin can bring it back.",
      };
    }
    const { itemId, outcome } = reused;

    await setUserFavorite(tx, actor.id, itemId, input.isFavorite);
    const [entry] = await tx
      .insert(entries)
      .values({
        itemId,
        userId: actor.id,
        consumedOn: startOfPeriod(input.consumedOn, input.consumedPrecision),
        consumedPrecision: input.consumedPrecision,
      })
      .returning({ id: entries.id });
    return { ok: true, outcome, itemId, entryId: entry.id };
  });
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * The item that already has this link, restored with `fields` if it was
 * deleted; `null` if it was deleted and the actor can't restore it.
 */
async function reuseItem(
  tx: Tx,
  actor: Actor,
  normalizedUrl: string,
  fields: Partial<typeof items.$inferInsert> & {
    metadata: Record<string, unknown>;
  },
) {
  const [current] = await tx
    .select({ id: items.id, deletedAt: items.deletedAt })
    .from(items)
    .where(eq(items.normalizedUrl, normalizedUrl))
    .for("update");
  if (!current.deletedAt) {
    return { itemId: current.id, outcome: "added_entry" as const };
  }
  if (!canDeleteItem(actor, await itemAuthorIds(tx, current.id))) return null;
  await tx
    .update(items)
    .set({
      ...fields,
      metadata: sql`${items.metadata} || ${JSON.stringify(fields.metadata)}::jsonb`,
      deletedAt: null,
      updatedAt: sql`now()`,
    })
    .where(eq(items.id, current.id));
  return { itemId: current.id, outcome: "restored" as const };
}

function withoutEmpty(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value != null),
  );
}
