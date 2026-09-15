export { cn } from "cn";

export function assertExhaustive(value: never): never {
  throw new Error(`Not exhaustive, unhandled type: ${value}`);
}

export function humanDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
