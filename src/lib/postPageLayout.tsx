import styled from "styled-components";
import { postBodyBlockGap, postBodyTypography } from "@/lib/postBodyTypography";

/** Outer `<main>` for post and editor routes (matches `[postSlug]/page.tsx`). */
export const PostPageShell = styled.main`
  line-height: 1.25;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--page-padding-vertical);
  padding-bottom: var(--page-padding-vertical);
  display: flex;
  flex-direction: column;
  gap: 5rem;
  align-items: center;
  background-color: var(--primary);
`;

/** Post heading (matches `Title` in `[postSlug]/page.tsx`). */
export const PostTitle = styled.h1`
  font-size: clamp(2rem, 1rem + 10vw, 5rem);
  line-height: 1;
  font-weight: 800;
`;

/**
 * Title field for the editor — same type metrics as `PostTitle`, input chrome removed
 * so it reads like the post heading.
 */
export const PostTitleInput = styled.input.attrs({ type: "text" })`
  font-size: 2rem;
  line-height: 1.5;
  font-weight: 800;
  font-family: inherit;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  outline: none;
  box-shadow: none;

  &::placeholder {
    color: color-mix(in srgb, var(--foreground) 42%, var(--comment));
  }

  &:focus {
    outline: none;
  }
`;

/** Body column: title + paragraphs, or the TipTap surface (matches `PostContent`). */
export const PostBodyColumn = styled.div`
  ${postBodyTypography}
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${postBodyBlockGap};
`;
