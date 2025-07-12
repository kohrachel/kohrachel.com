"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/blog") {
    return children;
  }
  return (
    <div className="w-screen min-h-screen xl:px-36 xl:py-16 p-10">
      {children}
    </div>
  );
}
