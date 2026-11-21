import "server-only";
import { imageSize } from "image-size";
import { THUMBNAIL_MAX_BYTES } from "@/domain-types/bluebook/details";
import { openPublic } from "./fetch";

export type ImageSize = { width: number; height: number };

/**
 * The size an image shows at, read from the start of its file: only as much
 * is downloaded as it takes to find it. Returns `null` if the image can't be
 * fetched or its size can't be read.
 */
export async function measureImage(url: string): Promise<ImageSize | null> {
  try {
    const opened = await openPublic(url, "image/*");
    const reader = opened?.response.body?.getReader();
    if (!reader) return null;
    let bytes = new Uint8Array(0);
    while (bytes.byteLength < THUMBNAIL_MAX_BYTES) {
      const { done, value } = await reader.read();
      if (value) bytes = concat(bytes, value);
      const size = readSize(bytes);
      if (size || done) {
        if (!done) await reader.cancel();
        return size;
      }
    }
    await reader.cancel();
    return null;
  } catch {
    return null;
  }
}

/** The size, or `null` if there isn't enough of the file yet to tell. */
function readSize(bytes: Uint8Array): ImageSize | null {
  try {
    const measured = imageSize(bytes);
    // SVGs can have fractional sizes.
    const width = Math.round(measured.width);
    const height = Math.round(measured.height);
    if (!width || !height) return null;
    const { orientation } = measured;
    // EXIF orientations 5–8 are turned a quarter, so they show sideways.
    return orientation && orientation >= 5
      ? { width: height, height: width }
      : { width, height };
  } catch {
    return null;
  }
}

function concat(a: Uint8Array, b: Uint8Array) {
  const joined = new Uint8Array(a.byteLength + b.byteLength);
  joined.set(a);
  joined.set(b, a.byteLength);
  return joined;
}
