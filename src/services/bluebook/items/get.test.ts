import { beforeAll, describe, expect, mock, test } from "bun:test";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

// Cache tags only mean something inside Next.js; record them instead.
const tags: string[] = [];
mock.module("next/cache", () => ({
  cacheTag: (...added: string[]) => tags.push(...added),
  cacheLife: () => {},
}));

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { getItemService } = await import("./get");
const { resetBluebook } = await import("@/test/bluebook-users");

describe.skipIf(!hasDatabase)("an item's links", () => {
  beforeAll(async () => {
    await resetBluebook(db);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, deleted_at) values
        ('a', 'https://example.com/a', 'Item A', null),
        ('b', 'https://example.com/b', 'Item B', null),
        ('c', 'https://example.com/c', 'Item C', null),
        ('d', 'https://example.com/d', 'Gone', now())`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on, consumed_precision, user_id) values
        (1, '2026-01-01', 'day', 3), (1, '2026-03-01', 'month', 1),
        (2, '2025-05-05', 'day', 1), (4, '2026-02-02', 'day', 1)`);
    await db.execute(sql`
      insert into bluebook.favorites (user_id, item_id) values (3, 1), (2, 1), (1, 2)`);
    await db.execute(sql`
      insert into bluebook.mentions (entry_id, target_item_id, context) values
        (1, 2, 'A mentions B.'), (2, 3, 'A mentions C later.'),
        (2, 4, 'A mentions a deleted item.'),
        (3, 1, 'B mentions A.'), (4, 1, 'A deleted item mentions A.')`);
  });

  test("names each entry's author and lists who starred it", async () => {
    const item = await getItemService(1);
    expect(item?.entries.map((entry) => entry.author)).toEqual([
      { id: 1, username: "owner", displayName: "Owner" },
      { id: 3, username: "member", displayName: "Member" },
    ]);
    expect(item?.favoritedBy).toEqual([2, 3]);
  });

  test("lists items it links out to, most recently mentioned first", async () => {
    const item = await getItemService(1);
    expect(item?.linksOut).toEqual([
      { id: 3, title: "Item C" },
      { id: 4, title: null },
      { id: 2, title: "Item B" },
    ]);
  });

  test("lists where it's mentioned, hiding deleted items' sentences", async () => {
    const item = await getItemService(1);
    expect(item?.mentionedIn).toEqual([
      {
        itemId: 4,
        title: null,
        consumedOn: "2026-02-02",
        consumedPrecision: "day",
        context: "",
      },
      {
        itemId: 2,
        title: "Item B",
        consumedOn: "2025-05-05",
        consumedPrecision: "day",
        context: "B mentions A.",
      },
    ]);
  });

  test("tags the page with every linked item, so their changes refresh it", async () => {
    tags.length = 0;
    await getItemService(1);
    expect([...new Set(tags)].sort()).toEqual([
      "bluebook-item-1",
      "bluebook-item-2",
      "bluebook-item-3",
      "bluebook-item-4",
    ]);
  });
});
