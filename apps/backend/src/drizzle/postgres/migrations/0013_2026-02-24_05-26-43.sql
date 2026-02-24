CREATE TABLE IF NOT EXISTS "uconfigs" (
	"uconfig_id" varchar(32) PRIMARY KEY NOT NULL,
	"provider_models" json NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uconfigs_server_ts" ON "uconfigs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uconfigs_key_tag" ON "uconfigs" USING btree ("key_tag");