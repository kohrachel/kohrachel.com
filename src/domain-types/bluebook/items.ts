import type { JSONContent } from "@tiptap/core";
import type { DatePrecision } from "./add";

/** An item and its entries, as its page shows them. */
export type ItemPageData = {
  id: number;
  url: string;
  normalizedUrl: string;
  platform: string;
  title: string;
  creator: string | null;
  publishedAt: Date | null;
  metadata: Record<string, unknown>;
  isFavorite: boolean;
  entries: {
    id: number;
    consumedOn: string;
    consumedPrecision: DatePrecision;
    content: JSONContent;
    plainText: string;
    contentEditedAt: Date | null;
  }[];
  /** Current titles of the items its entries mention; `null` if deleted. */
  mentionedTitles: Record<number, string | null>;
  /** Items its entries mention, most recently mentioned first. */
  linksOut: { id: number; title: string | null }[];
  /**
   * Other items' entries that mention it, newest first. A deleted item's
   * title is `null` and its sentence empty.
   */
  mentionedIn: {
    itemId: number;
    title: string | null;
    consumedOn: string;
    consumedPrecision: DatePrecision;
    context: string;
  }[];
};

/**
 * Players for the videos that play on their item page, read from the item's
 * cleaned-up link (see `CANONICAL_URL`) and its saved `playerId`.
 */
export const EMBEDS: {
  link: RegExp;
  player: (ids: string[], playerId: string | null) => string;
}[] = [
  {
    link: /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/,
    player: ([id]) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  {
    link: /^https:\/\/www\.bilibili\.com\/video\/(BV[0-9A-Za-z]{10})(?:\?p=(\d+))?$/,
    // Without the cid, Bilibili's player refuses some videos.
    player: ([bvid, part = "1"], cid) =>
      `https://player.bilibili.com/player.html?bvid=${bvid}${cid ? `&cid=${cid}` : ""}&p=${part}&danmaku=1&autoplay=0`,
  },
];

/** Videos without a known size are shown 16:9. */
export const DEFAULT_EMBED_SIZE = { width: 16, height: 9 };
