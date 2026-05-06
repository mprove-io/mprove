ALTER TABLE "cached_columns" ADD COLUMN "st" json NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "lt" json NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "key_tag" text;--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "unique_values_count" integer;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "st" json NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "lt" json NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "key_tag" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_key_tag" ON "cached_columns" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_key_tag" ON "cached_parts" USING btree ("key_tag");