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
  fallback: ["system-ui", "sans-serif"],
});

const basteleur = localFont({
  variable: "--font-basteleur",
  src: "./fonts/Basteleur-Bold.otf",
  fallback: ["system-ui", "sans-serif"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
