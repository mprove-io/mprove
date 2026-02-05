CREATE TABLE IF NOT EXISTS "events" (
	"event_id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"sequence" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"sandbox_type" varchar(32) NOT NULL,
	"agent" varchar(64) NOT NULL,
	"agent_mode" varchar(64),
	"permission_mode" varchar(64),
	"status" varchar(32) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"last_activity_ts" bigint,
	"running_start_ts" bigint,
	"expires_at" bigint,
	"created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_server_ts" ON "events" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_created_ts" ON "events" USING btree ("created_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_event_id" ON "events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_session_id" ON "events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_key_tag" ON "events" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_server_ts" ON "sessions" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_last_activity_ts" ON "sessions" USING btree ("last_activity_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_running_start_ts" ON "sessions" USING btree ("running_start_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_ts" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_created_ts" ON "sessions" USING btree ("created_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_project_id" ON "sessions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_status" ON "sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_key_tag" ON "sessions" USING btree ("key_tag");