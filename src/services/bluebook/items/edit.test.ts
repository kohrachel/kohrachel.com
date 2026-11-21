import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { ADMIN, MEMBER, OWNER, resetBluebook } =
  await import("@/test/bluebook-users");
const {
  addEntryService,
  deleteEntryService,
  deleteItemService,
  setFavoriteService,
  updateEntryDateService,
  updateItemService,
} = await import("./edit");

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) =>
  (await db.execute<Row>(query)).rows;

describe.skipIf(!hasDatabase)("editing an item", () => {
  beforeEach(async () => {
    await resetBluebook(db);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, creator, published_at)
      values ('https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              'Never Gonna Give You Up', 'Rick Astley', '2009-10-25T06:57:33Z')`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on, user_id)
      values (1, '2026-01-02', 3), (1, '2026-11-15', 3)`);
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

  test("turns favorite on and off for one person only", async () => {
    const favorites = () =>
      rows(
        sql`select user_id, item_id from bluebook.favorites order by user_id`,
      );
    await setFavoriteService(MEMBER, 1, true);
    await setFavoriteService(MEMBER, 1, true);
    await setFavoriteService(OWNER, 1, true);
    expect(await favorites()).toEqual([
      { user_id: "1", item_id: "1" },
      { user_id: "3", item_id: "1" },
    ]);
    await setFavoriteService(MEMBER, 1, false);
    expect(await favorites()).toEqual([{ user_id: "1", item_id: "1" }]);
  });

  test("soft-deletes an item, keeping its entries", async () => {
    expect(await deleteItemService(OWNER, 1)).toEqual({ ok: true, itemId: 1 });
    expect(
      await rows(
        sql`select deleted_at is not null as deleted from bluebook.items`,
      ),
    ).toEqual([{ deleted: true }]);
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);
  });

  test("doesn't change missing or deleted items", async () => {
    const missing = { ok: false as const, error: "That item doesn't exist." };
    expect(await setFavoriteService(MEMBER, 99, true)).toEqual(missing);
    await deleteItemService(OWNER, 1);
    expect(await deleteItemService(OWNER, 1)).toEqual(missing);
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
    expect(await deleteEntryService(OWNER, 1)).toEqual({
      ok: true,
      itemId: 1,
      alsoChangedItemIds: [],
    });
    expect(await deleteEntryService(OWNER, 2)).toEqual({
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
    expect(await deleteEntryService(OWNER, 1)).toEqual({
      ok: true,
      itemId: 1,
      alsoChangedItemIds: [2],
    });
  });

  test("changes an entry's date, at its precision", async () => {
    expect(
      await updateEntryDateService(OWNER, {
        id: 1,
        consumedOn: "2025-03-17",
        consumedPrecision: "month",
      }),
    ).toEqual({ ok: true, itemId: 1, alsoChangedItemIds: [] });
    expect(
      await rows(sql`
        select consumed_on::text as on, consumed_precision as precision
        from bluebook.entries where id = 1`),
    ).toEqual([{ on: "2025-03-01", precision: "month" }]);
  });

  test("reports the items an entry mentions when its date changes", async () => {
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title)
      values ('x', 'https://example.com/x', 'Mentioned')`);
    await db.execute(sql`
      insert into bluebook.mentions (entry_id, target_item_id) values (1, 2)`);
    expect(
      await updateEntryDateService(OWNER, {
        id: 1,
        consumedOn: "2024-06-30",
        consumedPrecision: "year",
      }),
    ).toEqual({ ok: true, itemId: 1, alsoChangedItemIds: [2] });
  });

  test("adds an entry for the person adding it", async () => {
    await addEntryService(MEMBER, {
      itemId: 1,
      consumedOn: "2023-08-09",
      consumedPrecision: "day",
    });
    expect(
      await rows(sql`select user_id from bluebook.entries where id = 3`),
    ).toEqual([{ user_id: "3" }]);
  });

  test("adds an entry, at its precision", async () => {
    expect(
      await addEntryService(OWNER, {
        itemId: 1,
        consumedOn: "2023-08-09",
        consumedPrecision: "year",
      }),
    ).toEqual({ ok: true, itemId: 1 });
    expect(
      await rows(sql`
        select consumed_on::text as on, consumed_precision as precision
        from bluebook.entries where id = 3`),
    ).toEqual([{ on: "2023-01-01", precision: "year" }]);
  });

  test("doesn't change or add entries of missing or deleted items", async () => {
    const date = {
      consumedOn: "2025-01-01",
      consumedPrecision: "day" as const,
    };
    expect(await addEntryService(OWNER, { itemId: 99, ...date })).toEqual({
      ok: false,
      error: "That item doesn't exist.",
    });
    await deleteItemService(OWNER, 1);
    expect(await addEntryService(OWNER, { itemId: 1, ...date })).toEqual({
      ok: false,
      error: "That item doesn't exist.",
    });
    expect(await updateEntryDateService(OWNER, { id: 1, ...date })).toEqual({
      ok: false,
      error: "That entry doesn't exist.",
    });
  });

  test("doesn't delete entries of deleted items", async () => {
    await deleteItemService(OWNER, 1);
    expect(await deleteEntryService(OWNER, 1)).toEqual({
      ok: false,
      error: "That entry doesn't exist.",
    });
  });

  describe("permissions", () => {
    beforeEach(async () => {
      await db.execute(sql`
        insert into bluebook.entries (item_id, consumed_on, user_id)
        values (1, '2026-11-16', 1)`);
    });

    const date = {
      consumedOn: "2025-01-01",
      consumedPrecision: "day" as const,
    };
    const notYours = {
      ok: false as const,
      error: "You can only change your own entries.",
    };

    test("members change only their own entries", async () => {
      expect(await deleteEntryService(MEMBER, 3)).toEqual(notYours);
      expect(await updateEntryDateService(MEMBER, { id: 3, ...date })).toEqual(
        notYours,
      );
      expect(await updateEntryDateService(MEMBER, { id: 1, ...date })).toEqual({
        ok: true,
        itemId: 1,
        alsoChangedItemIds: [],
      });
      expect(await deleteEntryService(MEMBER, 1)).toMatchObject({ ok: true });
    });

    test("owners and admins change anyone's entries", async () => {
      expect(await updateEntryDateService(ADMIN, { id: 1, ...date })).toEqual({
        ok: true,
        itemId: 1,
        alsoChangedItemIds: [],
      });
      expect(await deleteEntryService(ADMIN, 1)).toMatchObject({ ok: true });
      expect(await deleteEntryService(OWNER, 2)).toMatchObject({ ok: true });
    });

    test("members can't delete an item others have logged", async () => {
      expect(await deleteItemService(MEMBER, 1)).toEqual({
        ok: false,
        error:
          "Others have logged this too, so only the owner or an admin can delete it.",
      });
      expect(await deleteItemService(ADMIN, 1)).toEqual({
        ok: true,
        itemId: 1,
      });
    });

    test("members can delete an item only they have logged", async () => {
      await deleteEntryService(OWNER, 3);
      expect(await deleteItemService(MEMBER, 1)).toEqual({
        ok: true,
        itemId: 1,
      });
    });
  });
});
