import type { ReactNode } from "react";

export type Person = { id: number; displayName: string };

type Size = "sm" | "md" | "lg";

const PENS = ["green", "plum", "rust", "teal", "graphite"];

/** Each person keeps one pen colour everywhere, picked from their id. */
function penClass(person: Person) {
  return `bb-pen-${PENS[person.id % PENS.length]}`;
}

/**
 * A person's initial on their pen colour. Decoration: show the name too.
 * `plain` leaves the pen off, for someone who doesn't have one yet.
 */
export function Avatar({
  person,
  size = "md",
  plain = false,
}: {
  person: Person;
  size?: Size;
  plain?: boolean;
}) {
  const initial = Array.from(person.displayName.trim())[0] ?? "";
  return (
    <span
      aria-hidden="true"
      className={[
        "bb-avatar",
        size === "md" ? "" : `bb-avatar--${size}`,
        plain ? "" : penClass(person),
      ].join(" ")}
    >
      {initial.toUpperCase()}
    </span>
  );
}

/** A person's avatar and signed name, with `children` after the name. */
export function Byline({
  person,
  size = "md",
  children,
}: {
  person: Person;
  size?: "sm" | "md";
  children?: ReactNode;
}) {
  return (
    <span className={`bb-by ${penClass(person)}`}>
      <Avatar person={person} size={size} />
      <span
        className={`bb-by__name ${size === "sm" ? "bb-by__name--sm" : ""}`}
      >
        {person.displayName}
      </span>
      {children}
    </span>
  );
}
