ALTER TABLE "mconfigs" ADD COLUMN "malloy_query_stable" varchar;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "malloy_query_extra" varchar;--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "malloy_query";