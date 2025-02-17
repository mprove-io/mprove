ALTER TABLE "models" RENAME COLUMN "store" TO "file_store";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "stores";