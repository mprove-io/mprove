ALTER TABLE "providers" ADD COLUMN "models" json NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" DROP COLUMN IF EXISTS "kind";