import { Button } from "@/components/ui/button";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import type { ComponentProps } from "react";

type ButtonWithIconProps = ComponentProps<typeof Button> & {
  icon: IconSvgElement;
  children: React.ReactNode;
};

export function ButtonWithIcon({
  icon,
  children,
  ...props
}: ButtonWithIconProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" {...props}>
        <HugeiconsIcon icon={icon} /> {children}
      </Button>
    </div>
  );
}
