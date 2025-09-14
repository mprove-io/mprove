ALTER TABLE "connections" ADD COLUMN "bigquery_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "clickhouse_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "motherduck_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "postgres_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "snowflake_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "store_api_options" json;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "store_google_api_options" json;--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "base_url";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "headers";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "google_auth_scopes";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "motherduck_token";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "service_account_credentials";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "google_cloud_project";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "google_cloud_client_email";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "google_access_token";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "bigquery_query_size_limit_gb";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "account";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "warehouse";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "host";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "port";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "database";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "username";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "password";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "is_ssl";