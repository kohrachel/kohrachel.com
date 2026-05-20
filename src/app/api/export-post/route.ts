import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
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

  const { title, doc, id, originalSlug } = body as {
    title: unknown;
    doc: unknown;
    id?: unknown;
    originalSlug?: unknown;
  };

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

  if (id !== undefined && (typeof id !== "string" || id.trim() === "")) {
    return NextResponse.json(
      { error: "`id` must be a non-empty string when provided" },
      { status: 400 },
    );
  }

  if (originalSlug !== undefined && typeof originalSlug !== "string") {
    return NextResponse.json(
      { error: "`originalSlug` must be a string when provided" },
      { status: 400 },
    );
  }

  if (typeof originalSlug === "string" && !/^[\w-]+$/.test(originalSlug)) {
    return NextResponse.json(
      { error: "`originalSlug` is not a valid slug" },
      { status: 400 },
    );
  }

  const postId = typeof id === "string" ? id : randomUUID();

  const basename = toKebabCase(title);
  const filename = `${basename}.json`;
  const postsDir = path.join(process.cwd(), "posts");
  const filePath = path.join(postsDir, filename);

  const existingSlug =
    typeof id === "string" ? await findPostSlugById(postsDir, id) : undefined;
  const slugToDelete = existingSlug ?? originalSlug;

  const post: IPost = {
    ...(doc as IPost),
    id: postId,
    title,
    slug: basename,
    publishedAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(postsDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(post, null, 2), "utf8");

    if (slugToDelete && slugToDelete !== basename) {
      const oldFilePath = path.join(postsDir, `${slugToDelete}.json`);
      await fs.rm(oldFilePath, { force: true });
    }
  } catch (err) {
    console.error("Failed to write post:", err);
    return NextResponse.json(
      { error: "Failed to write file" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, filename, id: postId, slug: basename });
}

async function findPostSlugById(postsDir: string, id: string) {
  let files: string[];

  try {
    files = await fs.readdir(postsDir);
  } catch {
    return undefined;
  }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    try {
      const raw = await fs.readFile(path.join(postsDir, file), "utf8");
      const post = JSON.parse(raw) as Partial<IPost>;

      if (post.id === id) {
        return file.slice(0, -".json".length);
      }
    } catch {
      // Ignore malformed post files while looking for this id.
    }
  }

  return undefined;
}
