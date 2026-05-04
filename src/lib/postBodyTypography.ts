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

/** Heading styles for post body — sized per level with extra top padding to separate sections. */
export const postBodyHeadingStyles = css`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    line-height: 1.25;
    font-weight: 700;
  }

  h1 {
    font-size: 2.5rem;
  }
  h2 {
    font-size: 1.6rem;
  }
  h3 {
    font-size: 1.35rem;
  }
  h4 {
    font-size: 1.15rem;
  }
  h5 {
    font-size: 1.05rem;
  }
  h6 {
    font-size: 1rem;
  }

  /* Extra breathing room above headings that follow another block */
  :is(h1, h2, h3, h4, h5, h6):not(:first-child) {
    padding-top: 1rem;
  }
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
