import { Alert02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

/** A short message in place. Errors are red pen, always with words and an icon. */
export function Notice({
  kind = "plain",
  title,
  children,
}: {
  kind?: "plain" | "info" | "error";
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={`bb-notice ${kind === "plain" ? "" : `bb-notice--${kind}`}`}
      role={kind === "error" ? "alert" : undefined}
    >
      <HugeiconsIcon
        icon={kind === "error" ? Alert02Icon : InformationCircleIcon}
        size={20}
        strokeWidth={1.8}
      />
      <div>
        <p className="bb-notice__title">{title}</p>
        {children && <div className="bb-notice__body">{children}</div>}
      </div>
    </div>
  );
}
