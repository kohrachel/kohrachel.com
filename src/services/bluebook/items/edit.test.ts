import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const {
  deleteEntryService,
  deleteItemService,
  setFavoriteService,
  updateItemService,
} = await import("./edit");

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) =>
  (await db.execute<Row>(query)).rows;

describe.skipIf(!hasDatabase)("editing an item", () => {
  beforeEach(async () => {
    await db.execute(sql`truncate bluebook.items restart identity cascade`);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, creator, published_at)
      values ('https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              'Never Gonna Give You Up', 'Rick Astley', '2009-10-25T06:57:33Z')`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on)
      values (1, '2026-01-02'), (1, '2026-11-15')`);
  });

  test("changes the title, creator and publish date", async () => {
    expect(
      await updateItemService({
        id: 1,
        title: "New title",
        creator: null,
        publishedAt: "2010-01-02T00:00:00Z",
      }),
    ).toEqual({ ok: true, itemId: 1 });
    const [item] = await rows(sql`
      select title, creator,
             published_at = '2010-01-02T00:00:00Z'::timestamptz as published_matches
      from bluebook.items`);
    expect(item).toEqual({
      title: "New title",
      creator: null,
      published_matches: true,
    });
  });

  test("turns favorite on and off", async () => {
    await setFavoriteService(1, true);
    expect(await rows(sql`select is_favorite from bluebook.items`)).toEqual([
      { is_favorite: true },
    ]);
    await setFavoriteService(1, false);
    expect(await rows(sql`select is_favorite from bluebook.items`)).toEqual([
      { is_favorite: false },
    ]);
  });

  test("soft-deletes an item, keeping its entries", async () => {
    expect(await deleteItemService(1)).toEqual({ ok: true, itemId: 1 });
    expect(
      await rows(
        sql`select deleted_at is not null as deleted from bluebook.items`,
      ),
    ).toEqual([{ deleted: true }]);
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);
  });

  test("doesn't change missing or deleted items", async () => {
    const missing = { ok: false as const, error: "That item doesn't exist." };
    expect(await setFavoriteService(99, true)).toEqual(missing);
    await deleteItemService(1);
    expect(await deleteItemService(1)).toEqual(missing);
    expect(
      await updateItemService({
        id: 1,
        title: "x",
        creator: null,
        publishedAt: null,
      }),
    ).toEqual(missing);
  });

  test("deletes an entry, but not an item's last one", async () => {
    expect(await deleteEntryService(1)).toEqual({
      ok: true,
      itemId: 1,
      alsoChangedItemIds: [],
    });
    expect(await deleteEntryService(2)).toEqual({
      ok: false,
      error: "This is the only entry. Delete the item instead.",
    });
    expect(await rows(sql`select id from bluebook.entries`)).toEqual([
      { id: "2" },
    ]);
  });

  test("reports the items a deleted entry mentioned", async () => {
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title)
      values ('x', 'https://example.com/x', 'Mentioned')`);
    await db.execute(sql`
      insert into bluebook.mentions (entry_id, target_item_id) values (1, 2)`);
    expect(await deleteEntryService(1)).toEqual({
      ok: true,
      itemId: 1,
      alsoChangedItemIds: [2],
    });
  });

  test("doesn't delete entries of deleted items", async () => {
    await deleteItemService(1);
    expect(await deleteEntryService(1)).toEqual({
      ok: false,
      error: "That entry doesn't exist.",
    });
  });
});
