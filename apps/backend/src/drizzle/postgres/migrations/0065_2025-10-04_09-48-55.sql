ALTER TABLE "notes" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "public_key";--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "private_key";