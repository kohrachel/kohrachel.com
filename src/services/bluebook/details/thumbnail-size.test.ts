import { describe, expect, test } from "bun:test";
import { THUMBNAIL_MAX_BYTES } from "@/domain-types/bluebook/details";
import { html, installFakeNetwork, redirect } from "@/test/fake-network";
import { measureImage } from "./thumbnail-size";

const network = installFakeNetwork();
const URL = "https://img.example.com/cover.jpg";

const bytes = (...parts: (number[] | Uint8Array | string)[]) =>
  new Uint8Array(
    parts.flatMap((part) =>
      typeof part === "string"
        ? [...part].map((c) => c.charCodeAt(0))
        : [...part],
    ),
  );
const u16 = (n: number) => [n >> 8, n & 0xff];
const u32 = (n: number) => [
  n >>> 24,
  (n >> 16) & 0xff,
  (n >> 8) & 0xff,
  n & 0xff,
];

/** The start of a PNG: its signature and header chunk. */
const png = (width: number, height: number) =>
  bytes(
    [0x89],
    "PNG\r\n\x1a\n",
    u32(13),
    "IHDR",
    u32(width),
    u32(height),
    [8, 6, 0, 0, 0],
    u32(0),
  );

/** A JPEG whose size comes after `padding` bytes of other data. */
function jpeg(
  width: number,
  height: number,
  { padding = 0, orientation }: { padding?: number; orientation?: number } = {},
) {
  const exif = orientation
    ? bytes(
        [0xff, 0xe1],
        u16(2 + 6 + 8 + 2 + 12 + 4),
        "Exif\0\0",
        "MM",
        [0, 42],
        u32(8),
        u16(1),
        u16(0x0112),
        u16(3),
        u32(1),
        u16(orientation),
        [0, 0],
        u32(0),
      )
    : bytes();
  const filler: Uint8Array[] = [];
  for (let left = padding; left > 0; left -= 65533) {
    const size = Math.min(left, 65533);
    filler.push(bytes([0xff, 0xe2], u16(size + 2), new Uint8Array(size)));
  }
  return bytes(
    [0xff, 0xd8],
    // JFIF header, which every real JPEG starts with.
    [0xff, 0xe0],
    u16(16),
    "JFIF\0",
    [1, 1, 0, 0, 1, 0, 1, 0, 0],
    exif,
    ...filler,
    [0xff, 0xc0],
    u16(17),
    [8],
    u16(height),
    u16(width),
    [3],
    [1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1],
  );
}

/** Serves `data` in chunks, counting how many were read. */
function streamed(data: Uint8Array, chunkSize = 16 * 1024) {
  const served = { chunks: 0 };
  const route = () =>
    new Response(
      new ReadableStream({
        pull(controller) {
          const start = served.chunks * chunkSize;
          if (start >= data.byteLength) return controller.close();
          served.chunks++;
          controller.enqueue(data.subarray(start, start + chunkSize));
        },
      }),
      { headers: { "content-type": "image/jpeg" } },
    );
  return { route, served };
}

describe("measureImage", () => {
  test("reads a PNG's size", async () => {
    network.routes[URL] = () => new Response(png(1280, 720));
    expect(await measureImage(URL)).toEqual({ width: 1280, height: 720 });
  });

  test("reads a JPEG's size when it's far into the file", async () => {
    const { route } = streamed(jpeg(600, 900, { padding: 200 * 1024 }));
    network.routes[URL] = route;
    expect(await measureImage(URL)).toEqual({ width: 600, height: 900 });
  });

  test("stops downloading once it has the size", async () => {
    const image = bytes(jpeg(600, 900), new Uint8Array(800 * 1024));
    const { route, served } = streamed(image);
    network.routes[URL] = route;
    expect(await measureImage(URL)).toEqual({ width: 600, height: 900 });
    // The stream reads a chunk ahead; the image is 51 chunks long.
    expect(served.chunks).toBeLessThanOrEqual(2);
  });

  test("swaps width and height for a photo stored sideways", async () => {
    network.routes[URL] = () =>
      new Response(jpeg(4000, 3000, { orientation: 6 }));
    expect(await measureImage(URL)).toEqual({ width: 3000, height: 4000 });
    network.routes[URL] = () =>
      new Response(jpeg(4000, 3000, { orientation: 1 }));
    expect(await measureImage(URL)).toEqual({ width: 4000, height: 3000 });
  });

  test("gives up past the size limit", async () => {
    const { route, served } = streamed(
      jpeg(600, 900, { padding: THUMBNAIL_MAX_BYTES + 100 * 1024 }),
    );
    network.routes[URL] = route;
    expect(await measureImage(URL)).toBeNull();
    expect(served.chunks * 16 * 1024).toBeLessThan(
      THUMBNAIL_MAX_BYTES + 64 * 1024,
    );
  });

  test("returns null for anything that isn't a readable image", async () => {
    network.routes[URL] = html("<title>Not an image</title>");
    expect(await measureImage(URL)).toBeNull();
    delete network.routes[URL];
    expect(await measureImage(URL)).toBeNull();
    expect(await measureImage("not a link")).toBeNull();
  });

  test("never follows a redirect to a private address", async () => {
    network.routes[URL] = redirect("http://169.254.169.254/latest");
    expect(await measureImage(URL)).toBeNull();
    expect(network.requested).not.toContain("http://169.254.169.254/latest");
    expect(await measureImage("http://127.0.0.1/cover.png")).toBeNull();
    expect(network.requested).not.toContain("http://127.0.0.1/cover.png");
  });
});
