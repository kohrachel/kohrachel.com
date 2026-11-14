/** App path that redirects to a stored file's public URL (src/app/media). */
export function mediaPath(bucket: string, key: string) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `/media/${encodeURIComponent(bucket)}/${encodedKey}`;
}
