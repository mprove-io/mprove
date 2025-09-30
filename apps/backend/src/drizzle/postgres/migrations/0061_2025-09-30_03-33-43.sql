ALTER TABLE "structs" ADD COLUMN "mprove_config" json;--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "mprove_dir_value";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "case_sensitive_string_filters";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "simplify_safe_aggregates";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "week_start";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "allow_timezones";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "default_timezone";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "format_number";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "currency_prefix";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "currency_suffix";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "thousands_separator";