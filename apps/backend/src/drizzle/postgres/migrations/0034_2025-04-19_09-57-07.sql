ALTER TABLE "charts" DROP COLUMN IF EXISTS "access_users";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "access_users";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "access_users";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "access_users";