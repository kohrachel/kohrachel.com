import { JSONContent } from "@tiptap/core";

export interface IPost {
  title: string;
  slug: string;
  content: JSONContent;
}
