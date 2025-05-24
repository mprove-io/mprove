ALTER TABLE "envs" ADD COLUMN "is_fallback_to_prod_connections" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "envs" ADD COLUMN "is_fallback_to_prod_variables" boolean DEFAULT false;