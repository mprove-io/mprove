ALTER TABLE "mconfigs" ADD COLUMN "model_type" varchar;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "type" varchar;--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "is_store_model";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "is_store_model";