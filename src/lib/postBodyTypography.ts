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

/**
 * Google Docs-inspired heading styles.
 *
 * The parent container uses flex gap (postBodyBlockGap = 2.3rem) for baseline
 * block spacing. Negative margin-bottom on headings pulls the following content
 * closer so headings feel "attached" to their paragraph, while positive
 * margin-top on non-first headings adds extra separation from the previous section.
 */
export const postBodyHeadingStyles = css`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding-top: 2rem;
    padding-bottom: 1rem;
    color: var(--accent);
  }

  h1 {
    font-size: 2.6rem;
  }
  h2 {
    font-size: 1.9rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.15rem;
  }
  h5 {
    font-size: 1.05rem;
  }
  h6 {
    font-size: 1rem;
    font-style: italic;
  }

  :is(h1, h2, h3, h4, h5, h6):not(:first-child) {
    margin-top: 0.7rem;
  }
`;

/** List styles for ordered and unordered lists. */
export const postBodyListStyles = css`
  ul,
  ol {
    margin: 0;
    padding: 1.7rem 1.5rem;
    display: flex;
    flex-direction: column;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    line-height: 1.5;
    padding-left: 0.25rem;
  }

  /* Nested lists: tighter gap, indented, different marker */
  li > ul,
  li > ol {
    padding: 0 1.4rem;
  }

  li > ul {
    list-style-type: circle;
  }

  li > ul ul {
    list-style-type: square;
  }

  li > ol {
    list-style-type: lower-alpha;
  }

  li > ol ol {
    list-style-type: lower-roman;
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
