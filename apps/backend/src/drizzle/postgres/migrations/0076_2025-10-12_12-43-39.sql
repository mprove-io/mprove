ALTER TABLE "users" ADD COLUMN "password_hash" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_salt" varchar;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "salt";