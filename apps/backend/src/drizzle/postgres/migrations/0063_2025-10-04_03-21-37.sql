ALTER TABLE "connections" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "options";