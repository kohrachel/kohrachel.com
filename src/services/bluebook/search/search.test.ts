import { beforeAll, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. Search also needs the PGroonga extension
// (`brew install pgroonga`) in the database's `extensions` schema, on its
// search_path. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { searchFiltersService, searchItemsService } = await import("./search");

const ids = async (input: Parameters<typeof searchItemsService>[0]) =>
  (await searchItemsService(input)).map((result) => result.id);

describe.skipIf(!hasDatabase)("searching items", () => {
  beforeAll(async () => {
    await db.execute(sql`truncate bluebook.items restart identity cascade`);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, creator, is_favorite, deleted_at) values
        ('a', 'https://www.youtube.com/watch?v=aaaaaaaaaaa', 'There''s Something Weird Inside Mars', 'Cleo Abram', true, null),
        ('b', 'https://www.bilibili.com/video/BV154AwzWEje', '辩论：有按钮能知道对方爱你的程度', '阿詹', false, null),
        ('c', 'https://en.wikipedia.org/wiki/Mars', 'Mars', null, false, null),
        ('d', 'https://zh.wikipedia.org/wiki/猫', '猫', null, true, null),
        ('e', 'https://example.com/gone', 'Mars, deleted', null, false, now())`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on, consumed_precision, plain_text, created_at) values
        (1, '2025-03-04', 'day', 'Watched it twice. The part about the core was wild!', '2025-03-04'),
        (2, '2026-01-01', 'year', '和珍妮特一起看的。我们都没按。', '2026-01-02'),
        (3, '2024-05-01', 'month', '', '2024-05-01'),
        (4, '2026-11-15', 'day', '', '2026-11-15'),
        (5, '2026-11-15', 'day', '', '2026-11-15')`);
  });

  test("with no search, lists every item, most recently added-to first", async () => {
    expect(await ids({})).toEqual([4, 2, 1, 3]);
  });

  test("finds Chinese, including one character, and English in any case", async () => {
    expect(await ids({ query: "猫" })).toEqual([4]);
    expect(await ids({ query: "爱" })).toEqual([2]);
    expect(await ids({ query: "珍妮" })).toEqual([2]);
    expect(await ids({ query: "CLEO" })).toEqual([1]);
  });

  test("needs every word, in any field, with title matches first", async () => {
    expect(await ids({ query: "cleo mars" })).toEqual([1]);
    expect(await ids({ query: "mars" })).toEqual([1, 3]);
    expect(await ids({ query: "mars cleo nope" })).toEqual([]);
  });

  test("shows the matching sentence from an entry", async () => {
    const [result] = await searchItemsService({ query: "core" });
    expect(result).toMatchObject({
      id: 1,
      snippet: "The part about the core was wild!",
      lastConsumed: { on: "2025-03-04", precision: "day" },
    });
    const [chinese] = await searchItemsService({ query: "珍妮特" });
    expect(chinese.snippet).toBe("和珍妮特一起看的。");
  });

  test("treats query syntax as plain text", async () => {
    // Unescaped, this would mean "nope, or mars".
    expect(await ids({ query: "nope OR mars" })).toEqual([]);
  });

  test("filters by platform, including its subdomains", async () => {
    expect(await ids({ platform: "wikipedia.org" })).toEqual([4, 3]);
    expect(await ids({ platform: "youtube.com", query: "mars" })).toEqual([1]);
  });

  test("filters by year consumed and favorites", async () => {
    expect(await ids({ year: 2026 })).toEqual([4, 2]);
    expect(await ids({ favoritesOnly: true })).toEqual([4, 1]);
    expect(await ids({ favoritesOnly: true, year: 2025 })).toEqual([1]);
  });

  test("lists the platforms and years to filter by, without deleted items", async () => {
    expect(await searchFiltersService()).toEqual({
      platforms: ["bilibili.com", "wikipedia.org", "youtube.com"],
      years: [2026, 2025, 2024],
    });
  });
});
