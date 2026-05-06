DROP INDEX IF EXISTS "uidx_cached_columns_lookup";--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "cached_column_full_id" varchar(64) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "cached_part_full_id" varchar(64) PRIMARY KEY NOT NULL;