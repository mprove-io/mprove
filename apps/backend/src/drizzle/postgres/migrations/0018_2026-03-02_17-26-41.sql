ALTER TABLE "sessions" ADD COLUMN "api_key_prefix" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "api_key_prefix" varchar(32);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_sessions_api_key_prefix" ON "sessions" USING btree ("api_key_prefix");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_api_key_prefix" ON "users" USING btree ("api_key_prefix");