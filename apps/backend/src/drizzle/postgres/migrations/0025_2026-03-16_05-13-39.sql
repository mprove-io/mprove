ALTER TABLE "projects" ADD COLUMN "provider_models" json;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "provider_models_ts" bigint;--> statement-breakpoint
ALTER TABLE "uconfigs" DROP COLUMN IF EXISTS "provider_models";