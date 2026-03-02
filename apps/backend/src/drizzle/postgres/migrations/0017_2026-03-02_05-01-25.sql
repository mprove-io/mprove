CREATE TABLE IF NOT EXISTS "oc_events" (
	"event_id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"event_index" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oc_messages" (
	"message_id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oc_parts" (
	"part_id" varchar(255) PRIMARY KEY NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
DROP TABLE "events" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
DROP TABLE "parts" CASCADE;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_events_server_ts" ON "oc_events" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_events_created_ts" ON "oc_events" USING btree ("created_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_events_event_id" ON "oc_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_events_session_id" ON "oc_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_events_key_tag" ON "oc_events" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_messages_server_ts" ON "oc_messages" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_messages_session_id" ON "oc_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_messages_key_tag" ON "oc_messages" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_messages_created_ts" ON "oc_messages" USING btree ("created_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_parts_server_ts" ON "oc_parts" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_parts_message_id" ON "oc_parts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_parts_session_id" ON "oc_parts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_parts_key_tag" ON "oc_parts" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oc_parts_created_ts" ON "oc_parts" USING btree ("created_ts");