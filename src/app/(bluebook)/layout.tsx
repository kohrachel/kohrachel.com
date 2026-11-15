import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./bluebook.css";

export const metadata: Metadata = {
  title: "bluebook",
  description: "a log of things I watch and read",
};

export default function BluebookLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
