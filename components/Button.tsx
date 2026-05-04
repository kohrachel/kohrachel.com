import styled, { css } from "styled-components";
import Link from "next/link";

const buttonStyles = css`
  font-weight: 800;
  font-size: 0.95rem;
  padding: 0.6rem 1.25rem;
  border-radius: 16px;
  background: var(--primary);
  color: var(--header);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  ${buttonStyles}
  border: none;
`;

export const ButtonLink = styled(Link)`
  ${buttonStyles}
  position: relative;
  z-index: 1;
`;
