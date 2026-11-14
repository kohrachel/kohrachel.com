import { mergeAttributes } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { mediaPath } from "@/lib/media";

export const PostImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (el) =>
          el.hasAttribute("data-key") ? null : el.getAttribute("src"),
      },
      bucket: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-bucket"),
        renderHTML: (attrs) =>
          attrs.bucket ? { "data-bucket": attrs.bucket } : {},
      },
      key: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-key"),
        renderHTML: (attrs) => (attrs.key ? { "data-key": attrs.key } : {}),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { bucket, key } = node.attrs;
    const src = bucket && key ? mediaPath(bucket, key) : HTMLAttributes.src;
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { src }),
    ];
  },
});
