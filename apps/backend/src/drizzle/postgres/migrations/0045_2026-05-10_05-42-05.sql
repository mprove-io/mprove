CREATE INDEX IF NOT EXISTS "trgm_cached_parts_column_value_lc" ON "cached_parts" USING gin ("column_value_lc" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_field_name_lc" ON "model_field_leafs" USING gin ("field_name_lc" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_field_id" ON "model_field_leafs" USING gin ("field_id" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_malloy_field_name_lc" ON "model_field_leafs" USING gin ("malloy_field_name_lc" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_sql_name_lc" ON "model_field_leafs" USING gin ("sql_name_lc" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_label_lc" ON "model_field_leafs" USING gin ("label_lc" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trgm_model_field_leafs_description_lc" ON "model_field_leafs" USING gin ("description_lc" gin_trgm_ops);