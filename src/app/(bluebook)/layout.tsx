import type { Metadata } from "next";
import { Chiron_GoRound_TC, Geist_Mono, Poppins } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./bluebook.css";

// No fallback lists here: tokens.css puts the Chinese fonts right after each face.
const yangBagus = localFont({
  variable: "--font-yang-bagus-face",
  src: "../fonts/yang-bagus.otf",
  weight: "400",
});

const basteleur = localFont({
  variable: "--font-basteleur-face",
  src: "../fonts/Basteleur-Bold.otf",
  weight: "700",
});

const lcd = localFont({
  variable: "--font-lcd-face",
  src: [
    { path: "../fonts/lcd.ttf", weight: "400", style: "normal" },
    { path: "../fonts/lcd-italic.ttf", weight: "400", style: "italic" },
  ],
});

const poppins = Poppins({
  variable: "--font-poppins-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono-face",
  subsets: ["latin"],
  preload: false,
});

const chiron = Chiron_GoRound_TC({
  variable: "--font-chiron-face",
  weight: "700",
  preload: false,
  // Next.js has no measurements for this font to size a fallback by, and
  // each stack using it lists its own fallbacks after it.
  fallback: [],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "bluebook",
  description: "a log of things I watch and read",
};

export default function BluebookLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={[
        "h-full antialiased",
        yangBagus.variable,
        basteleur.variable,
        lcd.variable,
        poppins.variable,
        geistMono.variable,
        chiron.variable,
      ].join(" ")}
    >
      <head>
        {/* WenKai is 250 unicode-range slices; next/font would ship it whole. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/lxgw-wenkai.css" />
      </head>
      <body className="min-h-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
