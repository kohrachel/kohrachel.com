import { JSONContent } from "@tiptap/core";

export interface IPost {
  id?: string;
  title: string;
  slug: string;
  content: JSONContent;
  publishedAt: string;
}
