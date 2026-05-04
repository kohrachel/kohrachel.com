export const breakpoints = {
  sm: "48rem",
  md: "64rem",
} as const;

export const media = {
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
} as const;
