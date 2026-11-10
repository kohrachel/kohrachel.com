import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Page frame shared by the post page and the post editor: a back link over
 * the banner, and the bottom spacing below the post body.
 */
export function PostShell({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col pb-(--page-padding-top)">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "link" }),
          "absolute left-6 top-6 z-20 px-0 text-[#f5f2e8]",
        )}
      >
        ← {backLabel}
      </Link>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
