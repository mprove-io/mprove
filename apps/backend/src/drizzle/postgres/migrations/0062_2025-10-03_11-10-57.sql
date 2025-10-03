ALTER TABLE "connections" ADD COLUMN "options" text;--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "postgres_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "mysql_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "clickhouse_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "bigquery_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "snowflake_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "motherduck_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "trino_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "presto_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "store_api_options";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "store_google_api_options";