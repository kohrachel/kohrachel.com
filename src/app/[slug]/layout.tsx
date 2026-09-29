import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function SlugLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <div className="flex flex-1 flex-col px-(--page-padding-inline) pt-(--page-padding-top) pb-(--page-padding-bottom)">
      <div className="flex justify-start">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "link" }), "px-0")}
        >
          ← Back
        </Link>
      </div>
      <div className="mt-12 flex flex-col gap-24">{children}</div>
    </div>
  );
}
