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
    letter-spacing: 0.05rem;
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

/** Table styles shared by saved posts and the TipTap editing surface. */
export const postBodyTableStyles = css`
  .tableWrapper {
    max-width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    position: relative;
    min-width: 8rem;
    padding: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--header) 35%, transparent);
    vertical-align: top;
  }

  th {
    background: color-mix(in srgb, var(--selection) 40%, transparent);
    color: var(--accent);
    font-weight: 700;
    text-align: left;
  }

  th > *,
  td > * {
    margin: 0;
  }

  th p + p,
  td p + p {
    margin-top: 0.75rem;
  }

  .selectedCell::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .column-resize-handle {
    position: absolute;
    top: 0;
    right: -2px;
    bottom: -2px;
    width: 4px;
    background-color: var(--accent);
    pointer-events: none;
  }

  .resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
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
