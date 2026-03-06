DROP INDEX IF EXISTS "idx_sessions_running_start_ts";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_sessions_expires_ts";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "sandbox_start_ts" bigint;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "sandbox_end_ts" bigint;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "sandbox_info" json;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_sandbox_start_ts" ON "sessions" USING btree ("sandbox_start_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_sandbox_end_ts" ON "sessions" USING btree ("sandbox_end_ts");--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "running_start_ts";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "expires_at";