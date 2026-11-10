ALTER TABLE "posts" ADD COLUMN "draft" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp with time zone;