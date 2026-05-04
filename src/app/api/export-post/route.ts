import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { toKebabCase } from "@/lib/toKebabCase";
import { IPost } from "@/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("title" in body) ||
    !("doc" in body)
  ) {
    return NextResponse.json(
      { error: "Body must have `title` and `doc`" },
      { status: 400 },
    );
  }

  const { title, doc } = body as { title: unknown; doc: unknown };

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json(
      { error: "`title` must be a non-empty string" },
      { status: 400 },
    );
  }

  if (typeof doc !== "object" || doc === null) {
    return NextResponse.json(
      { error: "`doc` must be a non-null object" },
      { status: 400 },
    );
  }

  const post = doc as IPost;

  const basename = toKebabCase(title);
  const filename = `${basename}.json`;
  const postsDir = path.join(process.cwd(), "posts");
  const filePath = path.join(postsDir, filename);

  post.title = title;
  post.slug = basename;
  post.publishedAt = new Date().toISOString();

  try {
    await fs.mkdir(postsDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(post, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write post:", err);
    return NextResponse.json(
      { error: "Failed to write file" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, filename });
}
