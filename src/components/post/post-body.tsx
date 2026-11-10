import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/**
 * The journal page under the banner. Text width is fixed by
 * --page-padding-inline; the box widens independently via --box-gutter
 * without affecting the text. Its contents are styled by `.typeset`.
 */
export function PostBody({
  children,
  onMouseDown,
}: {
  children: ReactNode;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="mt-(--page-padding-top) rounded-lg bg-stone-900/70 pt-0 pb-6 backdrop-blur-xs sm:pt-8 sm:pb-13 md:pt-10 md:pb-16"
      style={
        {
          "--box-gutter": "6rem",
          "--effective-gutter":
            "min(var(--box-gutter), var(--page-padding-inline))",
          marginInline:
            "calc(var(--page-padding-inline) - var(--effective-gutter))",
          paddingInline: "var(--effective-gutter)",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
