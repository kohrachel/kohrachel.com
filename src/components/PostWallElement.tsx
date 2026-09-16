import Link from "next/link";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

export default function MainContent({
  id,
  children,
  active,
  className,
}: {
  id: number;
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/${id}`}
      className={`inline align-middle cursor-pointer transition-all duration-300 ${
        active ? "text-primary" : "text-green-800"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export function Separator({
  separatorIcon,
}: {
  separatorIcon: IconSvgElement;
}) {
  return (
    <span className="inline-flex mx-2 text-green-900">
      <HugeiconsIcon
        icon={separatorIcon}
        size={12}
        color="currentColor"
        strokeWidth={8}
      />
    </span>
  );
}
