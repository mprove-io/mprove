CREATE TABLE IF NOT EXISTS "cached_columns" (
	"project_id" varchar NOT NULL,
	"connection_id" varchar NOT NULL,
	"env_id" varchar NOT NULL,
	"schema_name" text NOT NULL,
	"table_name" text NOT NULL,
	"column_name" text NOT NULL,
	"requested_by_user_id" varchar,
	"status" varchar NOT NULL,
	"error_message" text,
	"started_ts" bigint NOT NULL,
	"completed_ts" bigint,
	"completed_duration_ms" bigint,
	"limit" integer NOT NULL,
	"is_limit_reached" boolean,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cached_parts" (
	"project_id" varchar NOT NULL,
	"connection_id" varchar NOT NULL,
	"env_id" varchar NOT NULL,
	"schema_name" text NOT NULL,
	"table_name" text NOT NULL,
	"column_name" text NOT NULL,
	"column_value" text,
	"count" integer NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "envs" ADD COLUMN "use_prod_cache" boolean;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_project_id" ON "cached_columns" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_connection_id" ON "cached_columns" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_env_id" ON "cached_columns" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_schema_name" ON "cached_columns" USING btree ("schema_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_table_name" ON "cached_columns" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_column_name" ON "cached_columns" USING btree ("column_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_status" ON "cached_columns" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_lookup" ON "cached_columns" USING btree ("project_id","connection_id","env_id","schema_name","table_name","column_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_server_ts" ON "cached_columns" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_project_id" ON "cached_parts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_connection_id" ON "cached_parts" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_env_id" ON "cached_parts" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_schema_name" ON "cached_parts" USING btree ("schema_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_table_name" ON "cached_parts" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_column_name" ON "cached_parts" USING btree ("column_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_column_value" ON "cached_parts" USING btree ("column_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_get_column_values" ON "cached_parts" USING btree ("project_id","connection_id","env_id","schema_name","table_name","column_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_search_value" ON "cached_parts" USING btree ("project_id","connection_id","env_id","column_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_server_ts" ON "cached_parts" USING btree ("server_ts");