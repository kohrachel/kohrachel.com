import styled, { css } from "styled-components";
import Link from "next/link";

const buttonStyles = css`
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.6rem 1.25rem;
  border: 1px solid color-mix(in srgb, var(--purple) 55%, var(--comment));
  border-radius: 8px;
  background: color-mix(in srgb, var(--selection) 45%, var(--background));
  color: var(--foreground);
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--purple) 25%, var(--background));
    border-color: var(--purple);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)`
  ${buttonStyles}
  position: relative;
  z-index: 1;
`;
