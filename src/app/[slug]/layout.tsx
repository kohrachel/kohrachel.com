import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function SlugLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <div className="relative flex flex-1 flex-col pb-(--page-padding-top)">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "link" }),
          "absolute left-6 top-6 z-20 px-0 text-[#f5f2e8]",
        )}
      >
        ← Back
      </Link>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
