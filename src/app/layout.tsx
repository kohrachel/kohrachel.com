import type { Metadata } from "next";
import { Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import styled from "styled-components";
import Link from "next/link";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rachel koh",
  description: "matcha-addled rabbit holes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${geistMono.variable}`}
    >
      <body>
        <Header>
          <div className="backdrop" aria-hidden />
          <BrandLink href="/">rachel koh</BrandLink>
        </Header>
        {children}
      </body>
    </html>
  );
}

const Header = styled.header`
  padding-block: var(--header-padding-block);
  padding-inline: var(--page-padding-inline);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  border-bottom: 1px solid color-mix(in srgb, var(--comment) 45%, transparent);
  isolation: isolate;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;

  .backdrop {
    position: absolute;
    z-index: 0;
    inset: 0;
    height: 200%;
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--background) 92%, transparent) 0%,
      transparent 55%
    );
    backdrop-filter: blur(14px) saturate(1.15);
    mask-image: linear-gradient(to bottom, black 0% 50%, transparent 50% 100%);
    pointer-events: none;
  }
`;

/* In-flow content is painted before position:absolute siblings; z-index lifts the title above .backdrop. */
const BrandLink = styled(Link)`
  position: relative;
  z-index: 1;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--purple);
  text-shadow: 0 0 24px color-mix(in srgb, var(--purple) 35%, transparent);
  transition:
    color 0.15s ease,
    text-shadow 0.15s ease;

  &:hover {
    color: var(--pink);
    text-shadow: 0 0 20px color-mix(in srgb, var(--pink) 40%, transparent);
  }
`;
