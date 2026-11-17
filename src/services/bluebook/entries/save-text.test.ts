import { beforeEach, describe, expect, test } from "bun:test";
import type { JSONContent } from "@tiptap/core";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { saveEntryTextService } = await import("./save-text");

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) =>
  (await db.execute(query)) as unknown as Row[];

const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content: content.length ? [{ type: "paragraph", content }] : [],
});
const text = (value: string): JSONContent => ({ type: "text", text: value });
const mention = (id: number, label = "?"): JSONContent => ({
  type: "mention",
  attrs: { id: String(id), label },
});

const entry = async () =>
  (
    await rows(sql`
      select plain_text, content_edited_at is not null as edited
      from bluebook.entries where id = 1`)
  )[0];
const mentionRows = () =>
  rows(sql`
    select target_item_id::int as target, context
    from bluebook.mentions order by target_item_id`);

describe.skipIf(!hasDatabase)("saving entry text", () => {
  beforeEach(async () => {
    await db.execute(sql`truncate bluebook.items restart identity cascade`);
    await db.execute(sql`
      insert into bluebook.items (url, normalized_url, title, deleted_at) values
        ('a', 'https://example.com/a', 'Item A', null),
        ('b', 'https://example.com/b', 'Mars', null),
        ('c', 'https://example.com/c', 'Gone', now())`);
    await db.execute(sql`
      insert into bluebook.entries (item_id, consumed_on) values
        (1, '2026-11-15'), (3, '2026-11-15')`);
  });

  test("saves text, its plain copy and mentions with their sentence", async () => {
    const result = await saveEntryTextService(
      1,
      doc(text("Great. Like "), mention(2, "old"), text(" but better!")),
    );
    expect(result).toEqual({ ok: true, itemId: 1, changedItemIds: [1, 2] });
    expect(await entry()).toEqual({
      plain_text: "Great. Like @Mars but better!",
      edited: false,
    });
    expect(await mentionRows()).toEqual([
      { target: 2, context: "Like @Mars but better!" },
    ]);
  });

  test("is edited only when existing text changes", async () => {
    await saveEntryTextService(1, doc(text("First")));
    expect((await entry()).edited).toBe(false);
    await saveEntryTextService(1, doc(text("First")));
    expect((await entry()).edited).toBe(false);
    await saveEntryTextService(1, doc(text("Second")));
    expect((await entry()).edited).toBe(true);
  });

  test("replaces mentions, and reports items it no longer mentions", async () => {
    await saveEntryTextService(1, doc(mention(2)));
    const result = await saveEntryTextService(1, doc(text("No mentions")));
    expect(result).toEqual({ ok: true, itemId: 1, changedItemIds: [1, 2] });
    expect(await mentionRows()).toEqual([]);
  });

  test("clearing the text removes its mentions", async () => {
    await saveEntryTextService(1, doc(mention(2)));
    await saveEntryTextService(1, doc());
    expect(await entry()).toEqual({ plain_text: "", edited: true });
    expect(await mentionRows()).toEqual([]);
  });

  test("ignores self-mentions, counts repeats once and unlinks missing items", async () => {
    await saveEntryTextService(
      1,
      doc(mention(1), mention(2), text(". "), mention(2), mention(99, "Nope")),
    );
    expect(await mentionRows()).toEqual([
      { target: 2, context: "@Item A@Mars." },
    ]);
    expect((await entry()).plain_text).toBe("@Item A@Mars. @Mars@Nope");
  });

  test("keeps mentions of deleted items", async () => {
    await saveEntryTextService(1, doc(mention(3, "Gone")));
    expect(await mentionRows()).toEqual([{ target: 3, context: "@Gone" }]);
  });

  test("refuses invalid text, missing entries and deleted items' entries", async () => {
    expect(
      await saveEntryTextService(1, {
        type: "doc",
        content: [{ type: "image" }],
      }),
    ).toEqual({ ok: false, error: "That text can't be saved." });
    const missing = { ok: false as const, error: "That entry doesn't exist." };
    expect(await saveEntryTextService(99, doc(text("x")))).toEqual(missing);
    expect(await saveEntryTextService(2, doc(text("x")))).toEqual(missing);
  });
});
