ALTER TABLE "posts" ADD COLUMN "slug" text;--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" ("slug") WHERE "deleted_at" is null;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_format_check" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and "slug" !~ '^[0-9]+$');--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_reserved_check" CHECK ("slug" not in ('editor'));