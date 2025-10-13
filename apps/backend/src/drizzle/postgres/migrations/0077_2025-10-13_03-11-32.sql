CREATE TABLE IF NOT EXISTS "dconfigs" (
	"dconfig_id" varchar(32) PRIMARY KEY NOT NULL,
	"st" text,
	"lt" text,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dconfigs_server_ts" ON "dconfigs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dconfigs_key_tag" ON "dconfigs" USING btree ("key_tag");