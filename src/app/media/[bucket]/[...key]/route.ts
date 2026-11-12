import { BUCKETS, storage } from "@/services/storage";

const PUBLIC_BUCKETS = new Set<string>(Object.values(BUCKETS));

export async function GET(
  _req: Request,
  ctx: RouteContext<"/media/[bucket]/[...key]">,
) {
  const { bucket, key } = await ctx.params;
  if (!PUBLIC_BUCKETS.has(bucket)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(null, {
    status: 307,
    headers: {
      Location: storage.getPublicUrl(bucket, key.join("/")),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
