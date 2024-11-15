CREATE TABLE IF NOT EXISTS "charts" (
	"chart_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"chart_id" varchar(32) NOT NULL,
	"title" varchar NOT NULL,
	"model_id" varchar(32) NOT NULL,
	"model_label" varchar NOT NULL,
	"file_path" varchar,
	"access_users" json NOT NULL,
	"access_roles" json NOT NULL,
	"gr" varchar,
	"hidden" boolean NOT NULL,
	"tiles" json NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
DROP TABLE "vizs" CASCADE;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_server_ts" ON "charts" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_struct_id" ON "charts" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_chart_id" ON "charts" USING btree ("chart_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_model_id" ON "charts" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_charts_struct_id_chart_id" ON "charts" USING btree ("struct_id","chart_id");