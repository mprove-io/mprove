ALTER TABLE "sessions" ADD COLUMN "provider_id" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "model_id" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "provider";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "model";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "last_message_provider_model";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "use_codex";