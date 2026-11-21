ALTER TYPE "bluebook"."user_role" ADD VALUE 'admin' BEFORE 'member';--> statement-breakpoint
CREATE TABLE "bluebook"."favorites" (
	"user_id" bigint,
	"item_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_pkey" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "bluebook"."favorites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bluebook"."entries" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "favorites_item_id_idx" ON "bluebook"."favorites" ("item_id");--> statement-breakpoint
ALTER TABLE "bluebook"."favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bluebook"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "bluebook"."favorites" ADD CONSTRAINT "favorites_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bluebook"."items"("id") ON DELETE CASCADE ON UPDATE CASCADE;