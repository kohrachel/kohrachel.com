import { beforeAll, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { CommonPlatform } from "@/domain-types/bluebook/links";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. Search also needs the PGroonga extension
// (`brew install pgroonga`) in the database's `extensions` schema, on its
// search_path. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { searchFiltersService, searchItemsService } = await import("./search");
const { resetBluebook } = await import("@/test/bluebook-users");

const ids = async (input: Parameters<typeof searchItemsService>[0]) =>
  (await searchItemsService(input)).map((result) => result.id);

describe.skipIf(!hasDatabase)("searching items", () => {
  beforeAll(async () => {
    await resetBluebook(db);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, creator, deleted_at) values
        ('a', 'https://www.youtube.com/watch?v=aaaaaaaaaaa', 'There''s Something Weird Inside Mars', 'Cleo Abram', null),
        ('b', 'https://www.bilibili.com/video/BV154AwzWEje', '辩论：有按钮能知道对方爱你的程度', '阿詹', null),
        ('c', 'https://en.wikipedia.org/wiki/Mars', 'Mars', null, null),
        ('d', 'https://zh.wikipedia.org/wiki/猫', '猫', null, null),
        ('e', 'https://example.com/gone', 'Mars, deleted', null, now()),
        ('f', 'https://blog.example.org/post', 'A blog post', null, null)`);
    await db.execute(sql`
      insert into bluebook.favorites (user_id, item_id) values (1, 1), (1, 4), (3, 2)`);
    await db.execute(sql`
      update bluebook.items set metadata = case id
        when 1 then '{"thumbnailUrl": "https://i.ytimg.com/vi/aaaaaaaaaaa/maxresdefault.jpg", "durationSeconds": 754, "thumbnailWidth": 1280, "thumbnailHeight": 720, "width": 1080, "height": 1920, "description": "Long text"}'::jsonb
        when 3 then '{"thumbnailUrl": "https://upload.wikimedia.org/mars.jpg"}'::jsonb
        when 4 then '{"thumbnailUrl": "javascript:alert(1)", "durationSeconds": "12", "width": "1080", "height": 1920, "thumbnailWidth": 0, "thumbnailHeight": 300}'::jsonb
        when 6 then '{"thumbnailUrl": 5, "durationSeconds": true, "width": 1080}'::jsonb
        else metadata end`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on, consumed_precision, plain_text, created_at, user_id) values
        (1, '2025-03-04', 'day', 'Watched it twice. The part about the core was wild!', '2025-03-04', 1),
        (2, '2026-01-01', 'year', '和珍妮特一起看的。我们都没按。', '2026-01-02', 1),
        (3, '2024-05-01', 'month', '', '2024-05-01', 1),
        (4, '2026-11-15', 'day', '', '2026-11-15', 1),
        (5, '2026-11-15', 'day', '', '2026-11-15', 1),
        (6, '2023-02-01', 'month', '', '2023-02-01', 1)`);
  });

  test("with no search, lists every item, most recently added-to first", async () => {
    expect(await ids({})).toEqual([4, 2, 1, 3, 6]);
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

  test("includes the thumbnail and its size, a video's length and size, and nothing else from the metadata", async () => {
    const results = await searchItemsService({});
    const byId = new Map(results.map((result) => [result.id, result]));
    expect(byId.get(1)).toMatchObject({
      thumbnailUrl: "https://i.ytimg.com/vi/aaaaaaaaaaa/maxresdefault.jpg",
      durationSeconds: 754,
      thumbnailSize: { width: 1280, height: 720 },
      videoSize: { width: 1080, height: 1920 },
    });
    expect(byId.get(1)).not.toHaveProperty("width");
    expect(byId.get(1)).not.toHaveProperty("description");
    expect(byId.get(3)).toMatchObject({
      thumbnailUrl: "https://upload.wikimedia.org/mars.jpg",
      durationSeconds: null,
      thumbnailSize: null,
      videoSize: null,
    });
    expect(byId.get(2)).toMatchObject({
      thumbnailUrl: null,
      durationSeconds: null,
    });
  });

  test("ignores a thumbnail, length or size that isn't the right kind of value", async () => {
    const results = await searchItemsService({});
    for (const id of [4, 6]) {
      expect(results.find((result) => result.id === id)).toMatchObject({
        thumbnailUrl: null,
        durationSeconds: null,
        thumbnailSize: null,
        videoSize: null,
      });
    }
  });

  test("treats query syntax as plain text", async () => {
    // Unescaped, this would mean "nope, or mars".
    expect(await ids({ query: "nope OR mars" })).toEqual([]);
  });

  test("filters by platforms, including their subdomains, or other sites", async () => {
    expect(await ids({ platforms: ["wikipedia.org"] })).toEqual([4, 3]);
    expect(await ids({ platforms: ["youtube.com"], query: "mars" })).toEqual([
      1,
    ]);
    expect(await ids({ platforms: ["youtube.com", "bilibili.com"] })).toEqual([
      2, 1,
    ]);
    expect(await ids({ platforms: ["other"] })).toEqual([6]);
    expect(await ids({ platforms: ["other", "youtube.com"] })).toEqual([1, 6]);
  });

  test("filters by year consumed and the viewer's favorites", async () => {
    expect(await ids({ year: 2026 })).toEqual([4, 2]);
    expect(await ids({ favoritesOnly: true, viewerId: 1 })).toEqual([4, 1]);
    expect(await ids({ favoritesOnly: true, viewerId: 1, year: 2025 })).toEqual(
      [1],
    );
    expect(await ids({ favoritesOnly: true, viewerId: 3 })).toEqual([2]);
    expect(await ids({ favoritesOnly: true })).toEqual([4, 2, 1, 3, 6]);
  });

  test("stars only the viewer's favorites, and none for visitors", async () => {
    const starred = async (viewerId: number | null) =>
      (await searchItemsService({ viewerId }))
        .filter((result) => result.isFavorite)
        .map((result) => result.id);
    expect(await starred(1)).toEqual([4, 1]);
    expect(await starred(3)).toEqual([2]);
    expect(await starred(null)).toEqual([]);
  });

  test("lists the common platforms, other sites and years to filter by, without deleted items", async () => {
    expect(await searchFiltersService()).toEqual({
      platforms: [
        CommonPlatform.Bilibili,
        CommonPlatform.Wikipedia,
        CommonPlatform.YouTube,
      ],
      hasOtherPlatforms: true,
      years: [2026, 2025, 2024, 2023],
    });
  });
});
