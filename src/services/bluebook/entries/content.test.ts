import { describe, expect, test } from "bun:test";
import type { JSONContent } from "@tiptap/core";
import {
  cleanEntryContent,
  collectMentions,
  entryPlainText,
  mentionedItemIds,
  relabelMentions,
} from "./content";

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});
const mention = (id: number, label: string): JSONContent => ({
  type: "mention",
  attrs: { id: String(id), label },
});
const paragraph = (...content: JSONContent[]): JSONContent => ({
  type: "paragraph",
  content,
});
const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content,
});

describe("cleanEntryContent", () => {
  test("keeps paragraphs, bold, italic, links, lists, quotes and mentions", () => {
    const content = doc(
      paragraph(
        text("Loved ", [{ type: "bold" }]),
        mention(2, "Mars"),
        text(" — see ", [{ type: "italic" }]),
        text("this", [
          { type: "link", attrs: { href: "https://example.com" } },
        ]),
      ),
      {
        type: "bulletList",
        content: [{ type: "listItem", content: [paragraph(text("one"))] }],
      },
      { type: "blockquote", content: [paragraph(text("quoted"))] },
    );
    const cleaned = cleanEntryContent(content);
    expect(cleaned).not.toBeNull();
    expect(entryPlainText(cleaned!)).toBe(
      "Loved @Mars — see this\none\nquoted",
    );
  });

  test("refuses anything entries don't allow, and broken documents", () => {
    expect(
      cleanEntryContent(
        doc({ type: "heading", attrs: { level: 1 }, content: [text("x")] }),
      ),
    ).toBeNull();
    expect(
      cleanEntryContent(doc({ type: "image", attrs: { src: "x.png" } })),
    ).toBeNull();
    expect(
      cleanEntryContent(doc(paragraph(text("x", [{ type: "code" }])))),
    ).toBeNull();
    expect(cleanEntryContent({ type: "paragraph" })).toBeNull();
    expect(cleanEntryContent({ type: "doc", content: [] })).toEqual({
      type: "doc",
      content: [],
    });
    expect(cleanEntryContent("hello")).toBeNull();
    expect(
      cleanEntryContent(doc(paragraph(text("x".repeat(250_000))))),
    ).toBeNull();
  });

  test("unlinks links that aren't web addresses", () => {
    const cleaned = cleanEntryContent(
      doc(
        paragraph(
          text("bad", [
            { type: "link", attrs: { href: "javascript:alert(1)" } },
          ]),
        ),
      ),
    );
    expect(cleaned?.content?.[0].content?.[0]).toEqual(text("bad"));
  });
});

describe("mentions", () => {
  const content = doc(
    paragraph(
      text("Watched with Jen. Reminded me of "),
      mention(2, "Old title"),
      text(" a lot! Also "),
      mention(3, "Gone"),
      text("."),
    ),
    paragraph(text("Again: "), mention(2, "Old title"), text(".")),
  );

  test("lists mentioned item ids once, in order", () => {
    expect(mentionedItemIds(content)).toEqual([2, 3]);
  });

  test("relabels mentions with current titles, unlinking missing items", () => {
    const relabeled = relabelMentions(content, new Map([[2, "Mars"]]));
    expect(entryPlainText(relabeled)).toBe(
      "Watched with Jen. Reminded me of @Mars a lot! Also @Gone.\nAgain: @Mars.",
    );
    expect(mentionedItemIds(relabeled)).toEqual([2]);
  });

  test("keeps the sentence around each item's first mention, not the entry's own item", () => {
    expect(collectMentions(content, 3)).toEqual([
      { targetItemId: 2, context: "Reminded me of @Old title a lot!" },
    ]);
  });

  test("finds Chinese sentences", () => {
    expect(
      collectMentions(
        doc(
          paragraph(text("看完了。跟"), mention(5, "猫"), text("很像！最后。")),
        ),
        1,
      ),
    ).toEqual([{ targetItemId: 5, context: "跟@猫很像！" }]);
  });
});
