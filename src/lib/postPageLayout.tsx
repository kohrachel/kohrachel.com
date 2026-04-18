import styled from "styled-components";
import { postBodyBlockGap, postBodyTypography } from "@/lib/postBodyTypography";

/** Outer `<main>` for post and editor routes (matches `[postSlug]/page.tsx`). */
export const PostPageShell = styled.main`
  font-size: 2rem;
  line-height: 1.25;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--page-padding-top);
  padding-bottom: var(--page-padding-bottom);
  display: flex;
  flex-direction: column;
  gap: 5rem;
  align-items: center;
`;

/** Post heading (matches `Title` in `[postSlug]/page.tsx`). */
export const PostTitle = styled.span`
  font-size: 2rem;
  line-height: 1.5;
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
