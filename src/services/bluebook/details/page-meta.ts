import {
  DETAILS_MAX_DESCRIPTION_LENGTH,
  EMPTY_DETAILS,
  type ItemDetails,
} from "@/domain-types/bluebook/details";

export type PageMeta = {
  details: ItemDetails;
  /** The page's oEmbed endpoint, if it advertises one. */
  oembedUrl: string | null;
};

type JsonLd = Record<string, unknown>;

/**
 * Reads details from a page's HTML: Open Graph and Twitter tags, standard
 * meta tags, JSON-LD structured data and `<title>`. Pure; no network.
 */
export function parsePageMeta(html: string, pageUrl: string): PageMeta {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd >= 0 ? html.slice(0, headEnd) : html;
  const meta = readMetaTags(head);
  const ld = readJsonLd(html);
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const value = cleanText(meta.get(key));
      if (value) return value;
    }
    return null;
  };

  const details: ItemDetails = {
    ...EMPTY_DETAILS,
    title:
      get("og:title", "twitter:title") ??
      ldText(ld?.headline) ??
      ldText(ld?.name) ??
      ldText(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]),
    creator:
      ldAuthor(ld) ??
      notAUrl(
        get(
          "author",
          "article:author",
          "book:author",
          "music:musician_description",
        ),
      ) ??
      null,
    publishedAt:
      toIsoDate(
        get(
          "article:published_time",
          "og:published_time",
          "video:release_date",
          "music:release_date",
          "datepublished",
          "date",
          "dc.date",
          "pubdate",
        ),
      ) ??
      toIsoDate(ldText(ld?.datePublished)) ??
      toIsoDate(ldText(ld?.uploadDate)),
    description: truncate(
      get("og:description", "twitter:description", "description") ??
        ldText(ld?.description),
    ),
    thumbnailUrl: absoluteHttpUrl(
      get("og:image:secure_url", "og:image", "twitter:image") ?? ldImage(ld),
      pageUrl,
    ),
    durationSeconds:
      positiveNumber(
        get("video:duration", "og:video:duration", "music:duration"),
      ) ?? isoDurationToSeconds(ldText(ld?.duration)),
    width: positiveNumber(get("og:video:width")),
    height: positiveNumber(get("og:video:height")),
  };

  const oembedHref = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => readAttributes(match[0]))
    .find(
      (attrs) =>
        attrs.get("rel")?.toLowerCase() === "alternate" &&
        attrs.get("type")?.toLowerCase() === "application/json+oembed",
    )
    ?.get("href");

  return {
    details,
    oembedUrl: absoluteHttpUrl(oembedHref ?? null, pageUrl),
  };
}

function readMetaTags(head: string) {
  const meta = new Map<string, string>();
  for (const match of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = readAttributes(match[0]);
    const key = (
      attrs.get("property") ??
      attrs.get("name") ??
      attrs.get("itemprop")
    )?.toLowerCase();
    const content = attrs.get("content");
    if (key && content !== undefined && !meta.has(key)) meta.set(key, content);
  }
  return meta;
}

function readAttributes(tag: string) {
  const attrs = new Map<string, string>();
  const pattern = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    attrs.set(
      match[1].toLowerCase(),
      decodeEntities(match[2] ?? match[3] ?? match[4] ?? ""),
    );
  }
  return attrs;
}

/** The first JSON-LD object that describes the page's content. */
function readJsonLd(html: string): JsonLd | null {
  const objects: JsonLd[] = [];
  const pattern =
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      collect(JSON.parse(match[1].trim()), objects);
    } catch {
      // Ignore malformed structured data.
    }
  }
  return (
    objects.find((o) => "headline" in o || "datePublished" in o) ??
    objects.find((o) => "author" in o) ??
    null
  );
}

function collect(value: unknown, into: JsonLd[]) {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, into);
  } else if (value && typeof value === "object") {
    const object = value as JsonLd;
    into.push(object);
    if (Array.isArray(object["@graph"])) collect(object["@graph"], into);
  }
}

function ldAuthor(ld: JsonLd | null) {
  const authors = [ld?.author].flat().filter(Boolean);
  const names = authors
    .map((author) =>
      typeof author === "string" ? author : (author as { name?: unknown }).name,
    )
    .map((name) => notAUrl(ldText(name)))
    .filter((name): name is string => !!name);
  return names.length ? names.join(", ") : null;
}

function ldImage(ld: JsonLd | null) {
  const image = [ld?.image].flat()[0];
  if (typeof image === "string") return ldText(image);
  return ldText((image as { url?: unknown } | undefined)?.url);
}

/** Collapses whitespace; `null` for anything that isn't a non-empty string. */
export function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  return text || null;
}

/** Text from `<title>` or JSON-LD, which may still contain HTML entities. */
function ldText(value: unknown) {
  return typeof value === "string" ? cleanText(decodeEntities(value)) : null;
}

function truncate(text: string | null) {
  return truncateText(text, DETAILS_MAX_DESCRIPTION_LENGTH);
}

/**
 * Cuts text to at most `max` characters, ending in "…" when it was longer.
 * Breaks at the last space if there's one in the last fifth, so words stay
 * whole; text without spaces (such as Chinese) is cut at the limit.
 */
export function truncateText(text: string | null, max: number) {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const end = space >= max * 0.8 ? space : cut.length;
  return `${cut.slice(0, end).trimEnd()}…`;
}

function notAUrl(text: string | null) {
  return text && !/^https?:\/\//i.test(text) ? text : null;
}

export function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function absoluteHttpUrl(value: string | null, base: string) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function positiveNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

/** `PT1H2M3S` → 3723. */
export function isoDurationToSeconds(value: string | null): number | null {
  const match = value?.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/,
  );
  if (!match || value === "P" || value === "PT") return null;
  const [, days, hours, minutes, seconds] = match.map((n) => Number(n ?? 0));
  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? Math.round(total) : null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  middot: "·",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

export function decodeEntities(text: string) {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity, code: string) => {
      if (code[0] === "#") {
        const point =
          code[1].toLowerCase() === "x"
            ? parseInt(code.slice(2), 16)
            : parseInt(code.slice(1), 10);
        return Number.isFinite(point) && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : entity;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
    },
  );
}
