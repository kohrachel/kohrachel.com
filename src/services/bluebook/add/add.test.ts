import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { saveInputSchema, type SaveInput } from "@/domain-types/bluebook/add";
import { installFakeNetwork } from "@/test/fake-network";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const network = installFakeNetwork();

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { saveLinkService } = await import("./save");
const { startOfPeriod } = await import("@/lib/bluebook/dates");
const { findItem, previewLinkService } = await import("./preview");
const { MEMBER, OWNER, resetBluebook } = await import("@/test/bluebook-users");

type Actor = typeof OWNER | typeof MEMBER;

const saveAs = (actor: Actor, overrides: Partial<SaveInput> = {}) =>
  saveLinkService(
    actor,
    saveInputSchema.parse({
      url: "https://youtu.be/dQw4w9WgXcQ?si=abc",
      resolvedUrl: "https://youtu.be/dQw4w9WgXcQ?si=abc",
      title: "Never Gonna Give You Up",
      creator: "Rick Astley",
      publishedAt: "2009-10-25T06:57:33Z",
      metadata: { durationSeconds: 214, description: null },
      consumedOn: "2026-11-15",
      ...overrides,
    }),
  );
const save = (overrides: Partial<SaveInput> = {}) => saveAs(OWNER, overrides);
const favorites = () =>
  rows(sql`select user_id, item_id from bluebook.favorites order by user_id`);

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) =>
  (await db.execute<Row>(query)).rows;

describe.skipIf(!hasDatabase)("saving a link", () => {
  beforeEach(async () => {
    await resetBluebook(db);
  });

  test("creates an item and its first entry", async () => {
    const result = await save();
    expect(result).toEqual({
      ok: true,
      outcome: "created",
      itemId: 1,
      entryId: 1,
    });

    const [item] = await rows(sql`select * from bluebook.items`);
    expect(item).toMatchObject({
      url: "https://youtu.be/dQw4w9WgXcQ?si=abc",
      normalized_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "youtube.com",
      title: "Never Gonna Give You Up",
      creator: "Rick Astley",
      metadata: { durationSeconds: 214 },
      deleted_at: null,
    });
    const [entry] = await rows(sql`select * from bluebook.entries`);
    // Raw SQL returns bigint ids as strings.
    expect(entry).toMatchObject({
      item_id: "1",
      user_id: "1",
      consumed_on: "2026-11-15",
      consumed_precision: "day",
      plain_text: "",
    });
  });

  test("adds an entry to the item that already has the link, in any form", async () => {
    await save();
    const again = await save({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42",
      resolvedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42",
      title: "A different title",
      consumedOn: "2026-12-01",
    });
    expect(again).toEqual({
      ok: true,
      outcome: "added_entry",
      itemId: 1,
      entryId: 2,
    });

    const [item] = await rows(sql`select title from bluebook.items`);
    expect(item.title).toBe("Never Gonna Give You Up");
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);
  });

  test("restores a deleted item with the form's details and its old entries", async () => {
    await save();
    await db.execute(sql`update bluebook.items set deleted_at = now()`);

    const restored = await save({ title: "Restored title", isFavorite: true });
    expect(restored).toEqual({
      ok: true,
      outcome: "restored",
      itemId: 1,
      entryId: 2,
    });

    const [item] = await rows(sql`select * from bluebook.items`);
    expect(item).toMatchObject({
      title: "Restored title",
      deleted_at: null,
    });
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);
    expect(await favorites()).toEqual([{ user_id: "1", item_id: "1" }]);
  });

  test("records who saved each entry, and stars it for them alone", async () => {
    await saveAs(OWNER, { isFavorite: true });
    await saveAs(MEMBER, { consumedOn: "2026-11-16" });
    expect(
      await rows(sql`select user_id from bluebook.entries order by id`),
    ).toEqual([{ user_id: "1" }, { user_id: "3" }]);
    expect(await favorites()).toEqual([{ user_id: "1", item_id: "1" }]);

    await saveAs(MEMBER, { consumedOn: "2026-11-17", isFavorite: true });
    await saveAs(OWNER, { consumedOn: "2026-11-18" });
    expect(await favorites()).toEqual([{ user_id: "3", item_id: "1" }]);
  });

  test("members restore a deleted item only if they alone had logged it", async () => {
    await saveAs(OWNER);
    await saveAs(MEMBER, { consumedOn: "2026-11-16" });
    await db.execute(sql`update bluebook.items set deleted_at = now()`);
    expect(await saveAs(MEMBER)).toEqual({
      ok: false,
      error:
        "This was deleted, and others had logged it, so only the owner or an admin can bring it back.",
    });
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);

    await db.execute(sql`delete from bluebook.entries where user_id = 1`);
    expect(await saveAs(MEMBER)).toMatchObject({
      ok: true,
      outcome: "restored",
    });
  });

  test("keeps old metadata that wasn't fetched again when restoring", async () => {
    await save({ metadata: { durationSeconds: 214, width: 1280 } });
    await db.execute(sql`update bluebook.items set deleted_at = now()`);

    await save({ metadata: { width: 640, description: "New" } });
    const [item] = await rows(sql`select metadata from bluebook.items`);
    expect(item.metadata).toEqual({
      durationSeconds: 214,
      width: 640,
      description: "New",
    });
  });

  test("handles two saves of a new link at once", async () => {
    const results = await Promise.all([save(), save()]);
    expect(results.map((r) => r.ok && r.outcome).sort()).toEqual([
      "added_entry",
      "created",
    ]);
    expect(await rows(sql`select id from bluebook.items`)).toHaveLength(1);
    expect(await rows(sql`select id from bluebook.entries`)).toHaveLength(2);
  });

  test("refuses pages and addresses that can't be saved", async () => {
    expect(
      await save({
        url: "https://www.youtube.com/results?search_query=x",
        resolvedUrl: "https://www.youtube.com/results?search_query=x",
      }),
    ).toEqual({ ok: false, error: "That kind of page can't be saved." });
    expect(
      await save({
        url: "http://127.0.0.1/x",
        resolvedUrl: "http://127.0.0.1/x",
      }),
    ).toEqual({ ok: false, error: "That link can't be saved." });
    expect(await rows(sql`select id from bluebook.items`)).toHaveLength(0);
  });

  test("stores approximate dates as the start of their period", async () => {
    await save({ consumedOn: "2023-03-17", consumedPrecision: "month" });
    await save({ consumedOn: "2019-08-30", consumedPrecision: "year" });
    expect(
      await rows(
        sql`select consumed_on, consumed_precision from bluebook.entries order by id`,
      ),
    ).toEqual([
      { consumed_on: "2023-03-01", consumed_precision: "month" },
      { consumed_on: "2019-01-01", consumed_precision: "year" },
    ]);
  });

  test("works for any site, with the platform taken from the link", async () => {
    await save({
      url: "https://www.someones.blog/posts/hello/?utm_source=x",
      resolvedUrl: "https://www.someones.blog/posts/hello/?utm_source=x",
      title: "Hello",
      creator: "  ",
      publishedAt: null,
    });
    const [item] = await rows(
      sql`select normalized_url, platform, creator from bluebook.items`,
    );
    expect(item).toEqual({
      normalized_url: "https://someones.blog/posts/hello",
      platform: "someones.blog",
      creator: null,
    });
  });
});

describe.skipIf(!hasDatabase)("previewing a link", () => {
  beforeEach(async () => {
    await resetBluebook(db);
  });

  test("fetches details for a new link", async () => {
    const result = await previewLinkService("https://youtu.be/dQw4w9WgXcQ", 1);
    expect(result).toMatchObject({
      ok: true,
      normalizedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      existing: null,
    });
    expect(result.ok && result.details).not.toBeNull();
    expect(network.requested.length).toBeGreaterThan(0);
  });

  test("summarizes an item you already have, without fetching", async () => {
    await save({ consumedOn: "2026-01-02" });
    await save({ consumedOn: "2026-11-15", consumedPrecision: "month" });
    network.requested.length = 0;

    const result = await previewLinkService("https://youtu.be/dQw4w9WgXcQ", 1);
    expect(result).toMatchObject({
      ok: true,
      details: null,
      existing: {
        id: 1,
        title: "Never Gonna Give You Up",
        platform: "youtube.com",
        isFavorite: false,
        publishedAt: "2009-10-25T06:57:33.000Z",
        isDeleted: false,
        entryCount: 2,
        lastConsumed: { on: "2026-11-01", precision: "month" },
      },
    });
    expect(network.requested).toEqual([]);
  });

  test("fetches details again for a deleted item", async () => {
    await save();
    await db.execute(sql`update bluebook.items set deleted_at = now()`);
    const result = await previewLinkService("https://youtu.be/dQw4w9WgXcQ", 1);
    expect(result.ok && result.existing?.isDeleted).toBe(true);
    expect(result.ok && result.details).not.toBeNull();
  });

  test("passes on why a link can't be used", async () => {
    expect(await previewLinkService("no link here", 1)).toEqual({
      ok: false,
      reason: "no_link",
    });
    expect(
      await previewLinkService(
        "https://www.youtube.com/results?search_query=x",
        1,
      ),
    ).toMatchObject({ ok: false, reason: "unsupported_page" });
  });

  test("finds nothing for a link no item has", async () => {
    expect(await findItem("https://example.com/none", 1)).toBeNull();
  });

  test("shows whether the viewer starred the item", async () => {
    await saveAs(MEMBER, { isFavorite: true });
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect((await findItem(url, 3))?.isFavorite).toBe(true);
    expect((await findItem(url, 1))?.isFavorite).toBe(false);
  });
});

describe("startOfPeriod", () => {
  test.each([
    ["2023-03-17", "day", "2023-03-17"],
    ["2023-03-17", "month", "2023-03-01"],
    ["2023-03-17", "year", "2023-01-01"],
  ] as const)("%s at %s precision", (date, precision, expected) => {
    expect(startOfPeriod(date, precision)).toBe(expected);
  });
});
