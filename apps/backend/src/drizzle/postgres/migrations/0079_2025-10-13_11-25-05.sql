ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_salt";