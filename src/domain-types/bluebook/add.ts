import { z } from "zod";
import type { DetailsResult } from "./details";
import type { CommonPlatform } from "./links";

export const DATE_PRECISIONS = ["day", "month", "year"] as const;
export type DatePrecision = (typeof DATE_PRECISIONS)[number];

const httpUrl = z.url({ protocol: /^https?$/ });
/** Empty or blank text from the form means "not set". */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((text) => text || null);

export const itemTitleSchema = z.string().trim().min(1, "Add a title").max(500);
export const publishedAtSchema = z.iso.datetime({ offset: true }).nullable();

export const previewInputSchema = z.object({
  text: z.string().trim().min(1, "Paste a link").max(5000),
});

/** Details that don't have their own column, kept in `items.metadata`. */
export const itemMetadataSchema = z
  .object({
    description: z.string().max(5000).nullable(),
    thumbnailUrl: httpUrl.nullable(),
    thumbnailWidth: z.number().int().positive().nullable(),
    thumbnailHeight: z.number().int().positive().nullable(),
    durationSeconds: z.number().positive().nullable(),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    playerId: z.string().max(100).nullable(),
  })
  .partial()
  .strict();

export const saveInputSchema = z.object({
  /** The link as pasted. */
  url: httpUrl,
  /**
   * The page it led to, from the preview. The duplicate key is computed from
   * this again on the server, never taken from the browser.
   */
  resolvedUrl: httpUrl,
  title: itemTitleSchema,
  creator: optionalText(300),
  publishedAt: publishedAtSchema,
  metadata: itemMetadataSchema.default({}),
  isFavorite: z.boolean().default(false),
  /** `YYYY-MM-DD`. With month or year precision, the day (and month) are ignored. */
  consumedOn: z.iso.date(),
  consumedPrecision: z.enum(DATE_PRECISIONS).default("day"),
});

export type PreviewInput = z.input<typeof previewInputSchema>;
export type SaveInput = z.input<typeof saveInputSchema>;
export type ParsedSaveInput = z.output<typeof saveInputSchema>;

/** An item that already has this link, shown so the form can say so. */
export type ExistingItem = {
  id: number;
  title: string;
  creator: string | null;
  platform: string;
  isFavorite: boolean;
  publishedAt: string | null;
  /** A deleted item is restored, with its old entries, when saved again. */
  isDeleted: boolean;
  entryCount: number;
  /** The latest consumed date (`YYYY-MM-DD`), or `null` with no entries. */
  lastConsumed: { on: string; precision: DatePrecision } | null;
};

export type PreviewResult =
  | { ok: false; reason: "no_link" | "short_link_failed" }
  | {
      ok: false;
      reason: "unsupported_page";
      commonPlatform: CommonPlatform;
    }
  | {
      ok: true;
      url: string;
      resolvedUrl: string;
      normalizedUrl: string;
      commonPlatform: CommonPlatform | null;
      existing: ExistingItem | null;
      /** Fetched for new and deleted items; `null` for one you already have. */
      details: DetailsResult | null;
    };

export type SaveOutcome = "created" | "added_entry" | "restored";

export type SaveResult =
  | {
      ok: true;
      outcome: SaveOutcome;
      itemId: number;
      entryId: number;
      /** Set if the link saved but the entry's text didn't. */
      textError?: string;
    }
  | { ok: false; error: string };
