import styled from "styled-components";
import {
  postBodyBlockGap,
  postBodyHeadingStyles,
  postBodyListStyles,
  postBodyTypography,
} from "@/lib/postBodyTypography";
import Link from "next/link";

/** Outer `<main>` for post and editor routes (matches `[postSlug]/page.tsx`). */
export const PostPageShell = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
`;

/** Post heading (matches `Title` in `[postSlug]/page.tsx`). */
export const PostTitle = styled.h1`
  font-size: clamp(1.5rem, 1rem + 10vw, 4rem);
  line-height: 1;
  font-weight: 800;
  margin: 0;
`;

/**
 * Title field for the editor — same type metrics as `PostTitle`, input chrome removed
 * so it reads like the post heading.
 */
export const PostTitleInput = styled.textarea.attrs({ rows: 1 })`
  font-size: clamp(1.5rem, 1rem + 10vw, 4rem);
  line-height: 1;
  font-weight: 800;
  font-family: inherit;
  width: 100%;
  min-height: 1em;
  margin: 0;
  padding: 0;
  border: none;
  resize: none;
  field-sizing: content;
  background: transparent;
  color: inherit;
  outline: none;
  box-shadow: none;
  font-family: var(--font-yang-bagus), Arial, Helvetica, sans-serif;

  &::placeholder {
    color: color-mix(in srgb, var(--header) 70%, transparent);
  }

  &:focus {
    outline: none;
  }
`;

/** Body column: title + paragraphs, or the TipTap surface (matches `PostContent`). */
export const PostBodyColumn = styled.div`
  ${postBodyTypography}
  ${postBodyHeadingStyles}
  ${postBodyListStyles}
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${postBodyBlockGap};
  padding-inline: var(--page-padding-inline);
  padding-bottom: var(--post-page-padding-vertical);
  background-color: var(--primary);
`;

export const TitleAndBackButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--post-page-padding-vertical);
`;

export const BackButton = styled(Link)`
  font-size: 1rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--header) 50%, var(--accent));
  text-decoration: none;
  border-radius: 0.5rem;
  width: fit-content;

  transition:
    color 0.15s ease,
    text-decoration 0.15s ease;

  &:hover {
    color: var(--header);
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-decoration-style: solid;
    text-underline-offset: 2px;
  }
`;

export const PostHeaderSection = styled.header`
  width: 100%;
  height: min-content;
  overflow: visible;
  background-color: var(--background);
`;
