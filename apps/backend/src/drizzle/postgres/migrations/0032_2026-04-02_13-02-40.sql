ALTER TABLE "sessions" ADD COLUMN "codex_auth_update_ts" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "codex_auth_update_ts" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "codex_auth_expires_ts" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "codex_auth_refresh_ts" bigint;