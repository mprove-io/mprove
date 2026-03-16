ALTER TABLE "projects" ADD COLUMN "provider_models_opencode" json;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "provider_models_opencode_ts" bigint;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "provider_models_ai" json;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "provider_models_ai_ts" bigint;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "provider_models";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "provider_models_ts";