import type { Extensions } from "@tiptap/core";
import { Mention, type MentionOptions } from "@tiptap/extension-mention";
import { StarterKit } from "@tiptap/starter-kit";
import { ENTRY_LINK } from "@/domain-types/bluebook/entries";

/**
 * What entry text can contain: paragraphs, bold, italic, links, lists,
 * quotes and mentions. Shared by the editor, the server's checks and the
 * plain-text copy. The editor passes its `@` picker as `mention` options.
 */
export function entryExtensions(
  mention: Partial<MentionOptions> = {},
): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      underline: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        isAllowedUri: (url) => ENTRY_LINK.test(url),
      },
    }),
    Mention.configure({
      deleteTriggerWithBackspace: true,
      renderText: ({ node }) => `@${node.attrs.label ?? ""}`,
      ...mention,
    }),
  ];
}

export const ENTRY_EXTENSIONS = entryExtensions();
