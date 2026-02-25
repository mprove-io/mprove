CREATE TABLE IF NOT EXISTS "oc_sessions" (
	"session_id" varchar(255) PRIMARY KEY NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_sessions_server_ts" ON "oc_sessions" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_sessions_key_tag" ON "oc_sessions" USING btree ("key_tag");