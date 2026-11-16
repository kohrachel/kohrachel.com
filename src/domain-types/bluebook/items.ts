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
    plainText: string;
  }[];
};

/**
 * Players for the videos that play on their item page, read from the item's
 * cleaned-up link (see `CANONICAL_URL`).
 */
export const EMBEDS = [
  {
    link: /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/,
    player: ([id]: string[]) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  {
    link: /^https:\/\/www\.bilibili\.com\/video\/(BV[0-9A-Za-z]{10})(?:\?p=(\d+))?$/,
    player: ([bvid, part = "1"]: string[]) =>
      `https://player.bilibili.com/player.html?bvid=${bvid}&p=${part}&danmaku=1&autoplay=0`,
  },
];

/** Videos without a known size are shown 16:9. */
export const DEFAULT_EMBED_SIZE = { width: 16, height: 9 };
