import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function SlugLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <div className="relative flex flex-1 flex-col px-(--page-padding-inline) pb-(--page-padding-bottom)">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "link" }),
          "absolute left-4 top-2 z-10 px-0 text-[#f5f2e8]",
        )}
      >
        ← Back
      </Link>
      <div className="flex flex-col gap-24">{children}</div>
    </div>
  );
}
