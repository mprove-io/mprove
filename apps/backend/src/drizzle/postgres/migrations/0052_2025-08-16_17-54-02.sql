ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "unsafe_select";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "warn_select";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "join_aggregations";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "views";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "udfs_dict";