ALTER TABLE "sessions" ADD COLUMN "provider" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "agent";