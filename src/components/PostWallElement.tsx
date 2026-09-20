import Link from "next/link";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

export default function MainContent({
  id,
  href,
  external,
  children,
  active,
  className,
}: {
  id: number;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href ?? `/${id}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
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
