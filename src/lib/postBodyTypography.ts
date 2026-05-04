import { css } from "styled-components";

/** Space between body paragraphs (matches PostContent flex `gap`). */
export const postBodyBlockGap = "2.3rem";

/**
 * Regular body copy (matches `PostContent` in `[postSlug]/page.tsx`).
 * Use inside TipTap’s `.ProseMirror` or other body containers — not for titles.
 */
export const postBodyTypography = css`
  text-align: start;
`;

/** Paragraph rhythm for block flow (editor); mirrors stacked `<p>` spacing in the post layout. */
export const postBodyParagraphSpacing = css`
  p {
    margin: 0;
  }

  p + p {
    margin-top: ${postBodyBlockGap};
  }
`;
