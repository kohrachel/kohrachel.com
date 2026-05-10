import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { IPost } from "@/types";
import type { JSONContent } from "@tiptap/core";
import EditorClient from "../EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ postSlug?: string[] }>;
}) {
  const { postSlug } = await params;
  const slug = postSlug?.[0];

  if (!slug) {
    return <EditorClient />;
  }

  const filePath = path.join(process.cwd(), "posts", `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const post: IPost = JSON.parse(raw);
  const doc: JSONContent = {
    type: "doc",
    content: post.content as unknown as JSONContent[],
  };

  return <EditorClient initialTitle={post.title} initialContent={doc} />;
}
