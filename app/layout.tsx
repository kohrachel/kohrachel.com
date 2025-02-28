import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const Footer = () => {
  return (
    <div className="w-full h-12 bg-stone-900 text-gray-300 flex items-center justify-between fixed bottom-0 left-0 text-xs px-4">
      <div>Built by rachel with love, sweat, and (a lot of) tears.</div>
      <div className="flex flex-row gap-2">
        <span>GitHub</span>
        <span>LinkedIn</span>
      </div>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
      >
        <div className="flex-grow overflow-auto pb-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
