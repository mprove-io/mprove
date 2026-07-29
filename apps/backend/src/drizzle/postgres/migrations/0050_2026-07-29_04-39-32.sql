CREATE TABLE IF NOT EXISTS "providers" (
	"provider_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"provider_id" varchar(32) NOT NULL,
	"kind" varchar NOT NULL,
	"type" varchar NOT NULL,
	"is_enabled" boolean NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_providers_server_ts" ON "providers" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_providers_project_id" ON "providers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_providers_provider_id" ON "providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_providers_key_tag" ON "providers" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_providers_project_id_provider_id" ON "providers" USING btree ("project_id","provider_id");