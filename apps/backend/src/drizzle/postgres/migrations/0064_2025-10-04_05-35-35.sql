ALTER TABLE "projects" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "public_key";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "private_key";