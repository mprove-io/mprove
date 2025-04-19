DROP TABLE "metrics" CASCADE;--> statement-breakpoint
ALTER TABLE "structs" ADD COLUMN "metrics" json DEFAULT '[]'::json;