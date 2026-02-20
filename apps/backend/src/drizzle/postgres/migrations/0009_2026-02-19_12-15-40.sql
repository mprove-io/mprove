CREATE TABLE IF NOT EXISTS "messages" (
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
CREATE TABLE IF NOT EXISTS "parts" (
	"part_id" varchar(255) PRIMARY KEY NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_server_ts" ON "messages" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_session_id" ON "messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_key_tag" ON "messages" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_created_ts" ON "messages" USING btree ("created_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_server_ts" ON "parts" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_message_id" ON "parts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_session_id" ON "parts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_key_tag" ON "parts" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_created_ts" ON "parts" USING btree ("created_ts");