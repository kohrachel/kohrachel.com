import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { IPost } from "@/types";

export async function GET() {
  const postsDir = path.join(process.cwd(), "posts");
  const posts: IPost[] = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(postsDir, file), "utf8");
      const post = JSON.parse(content);
      return {
        title: post.title,
        slug: post.slug,
        content: post.content,
        publishedAt: post.publishedAt,
      };
    });

  return NextResponse.json(posts);
}
