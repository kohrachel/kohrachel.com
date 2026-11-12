import { ReactNodeViewRenderer } from "@tiptap/react";
import { PostImage } from "@/components/post/post-image";
import { ImageNodeView } from "./image-node-view";

export const EditorPostImage = PostImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
