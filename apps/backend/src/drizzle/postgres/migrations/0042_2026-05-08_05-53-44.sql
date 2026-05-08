CREATE TABLE IF NOT EXISTS "model_field_leafs" (
	"model_field_leaf_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar NOT NULL,
	"model_id" varchar NOT NULL,
	"model_type" varchar NOT NULL,
	"connection_id" varchar,
	"connection_type" varchar,
	"field_id" text NOT NULL,
	"field_name" text,
	"field_path" json,
	"field_class" varchar,
	"field_result" varchar,
	"field_type" varchar,
	"label" text,
	"description" text,
	"hidden" boolean,
	"required" boolean,
	"sql_name" text,
	"top_id" text,
	"top_label" text,
	"group_id" text,
	"group_label" text,
	"malloy_field_name" text,
	"malloy_field_path" json,
	"malloy_tags" json,
	"mprove_tags" json,
	"schema_name" text,
	"table_name" text,
	"column_name" text,
	"field" json NOT NULL,
	"malloy_field_def" json,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_struct_id" ON "model_field_leafs" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_model_id" ON "model_field_leafs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_model_type" ON "model_field_leafs" USING btree ("model_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_field_id" ON "model_field_leafs" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_connection_id" ON "model_field_leafs" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_schema_name" ON "model_field_leafs" USING btree ("schema_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_table_name" ON "model_field_leafs" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_column_name" ON "model_field_leafs" USING btree ("column_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_model_field_leafs_server_ts" ON "model_field_leafs" USING btree ("server_ts");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_model_field_leafs_struct_model_field" ON "model_field_leafs" USING btree ("struct_id","model_id","field_id");