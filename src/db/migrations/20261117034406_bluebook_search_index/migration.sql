CREATE EXTENSION IF NOT EXISTS pgroonga WITH SCHEMA extensions;--> statement-breakpoint
CREATE INDEX "entries_plain_text_search_idx" ON "bluebook"."entries" USING pgroonga ("plain_text");--> statement-breakpoint
CREATE INDEX "items_search_idx" ON "bluebook"."items" USING pgroonga ("title","creator","platform");