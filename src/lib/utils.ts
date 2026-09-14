export { cn } from "cn";

export function assertExhaustive(value: never): never {
  throw new Error(`Not exhaustive, unhandled type: ${value}`);
}
