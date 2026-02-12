ALTER TABLE "events" ADD COLUMN "event_index" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sender" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "sequence";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "type";