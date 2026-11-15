import { pgSchema } from "drizzle-orm/pg-core";

export const bluebook = pgSchema("bluebook");

export const datePrecision = bluebook.enum("date_precision", [
  "day",
  "month",
  "year",
]);
