DROP INDEX IF EXISTS "idx_cached_columns_schema_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_columns_table_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_columns_column_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_schema_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_table_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_column_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_column_value";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_model_field_leafs_schema_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_model_field_leafs_table_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_model_field_leafs_column_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_get_column_values";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cached_parts_search_value";--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "schema_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "table_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_columns" ADD COLUMN "column_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "schema_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "table_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "column_name_lc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cached_parts" ADD COLUMN "column_value_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "field_name_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "label_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "description_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "sql_name_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "malloy_field_name_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "schema_name_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "table_name_lc" text;--> statement-breakpoint
ALTER TABLE "model_field_leafs" ADD COLUMN "column_name_lc" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_schema_name_lc" ON "cached_columns" USING btree ("schema_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_table_name_lc" ON "cached_columns" USING btree ("table_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_columns_column_name_lc" ON "cached_columns" USING btree ("column_name_lc");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_cached_columns_lookup" ON "cached_columns" USING btree ("project_id","connection_id","env_id","schema_name_lc","table_name_lc","column_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_schema_name_lc" ON "cached_parts" USING btree ("schema_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_table_name_lc" ON "cached_parts" USING btree ("table_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_column_name_lc" ON "cached_parts" USING btree ("column_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_column_value_lc" ON "cached_parts" USING btree ("column_value_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_schema_name_lc" ON "model_field_leafs" USING btree ("schema_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_table_name_lc" ON "model_field_leafs" USING btree ("table_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_column_name_lc" ON "model_field_leafs" USING btree ("column_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_struct_type_result" ON "model_field_leafs" USING btree ("struct_id","model_type","field_result");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_get_column_values" ON "cached_parts" USING btree ("project_id","connection_id","env_id","schema_name_lc","table_name_lc","column_name_lc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cached_parts_search_value" ON "cached_parts" USING btree ("project_id","env_id","column_value_lc");--> statement-breakpoint
ALTER TABLE "cached_columns" DROP COLUMN IF EXISTS "schema_name";--> statement-breakpoint
ALTER TABLE "cached_columns" DROP COLUMN IF EXISTS "table_name";--> statement-breakpoint
ALTER TABLE "cached_columns" DROP COLUMN IF EXISTS "column_name";--> statement-breakpoint
ALTER TABLE "cached_parts" DROP COLUMN IF EXISTS "schema_name";--> statement-breakpoint
ALTER TABLE "cached_parts" DROP COLUMN IF EXISTS "table_name";--> statement-breakpoint
ALTER TABLE "cached_parts" DROP COLUMN IF EXISTS "column_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "field_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "label";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "sql_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "malloy_field_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "schema_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "table_name";--> statement-breakpoint
ALTER TABLE "model_field_leafs" DROP COLUMN IF EXISTS "column_name";