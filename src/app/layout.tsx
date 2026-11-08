import type { Metadata } from "next";
import { Geist_Mono, Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const yangBagus = localFont({
  variable: "--font-yang-bagus",
  src: "./fonts/yang-bagus.otf",
  fallback: ["system-ui", "sans-serif"],
});

const tiny = localFont({
  variable: "--font-tiny",
  src: "./fonts/tiny-variable.ttf",
  // Not used on first paint; still loads on demand if a page uses it.
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

const basteleur = localFont({
  variable: "--font-basteleur",
  src: "./fonts/Basteleur-Bold.otf",
  fallback: ["system-ui", "sans-serif"],
});

const lcd = localFont({
  variable: "--font-lcd",
  src: [
    { path: "./fonts/lcd.ttf", style: "normal" },
    { path: "./fonts/lcd-italic.ttf", style: "italic" },
  ],
  fallback: ["ui-monospace", "monospace"],
  // Not used on first paint; still loads on demand if a page uses it.
  preload: false,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

const inter = Inter({
  variable: "--font-inter",
  // Not used on first paint; still loads on demand if a page uses it.
  preload: false,
  subsets: ["latin"],
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  // Not used on first paint; still loads on demand if a page uses it.
  preload: false,
  subsets: ["latin"],
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "Rachel Koh",
  description: "matcha-addled rabbit holes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        poppins.variable,
        yangBagus.variable,
        tiny.variable,
        basteleur.variable,
        lcd.variable,
        geistMono.variable,
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <div className="typeset w-full flex flex-1 flex-col">{children}</div>
        </TooltipProvider>
      </body>
    </html>
  );
}
