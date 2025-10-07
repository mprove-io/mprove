ALTER TABLE "avatars" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "avatars" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "bridges" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "bridges" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "envs" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "envs" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "kits" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "kits" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "structs" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "structs" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "st" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lt" text;--> statement-breakpoint
ALTER TABLE "avatars" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "branches" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "bridges" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "envs" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "kits" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "orgs" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "tab";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "tab";