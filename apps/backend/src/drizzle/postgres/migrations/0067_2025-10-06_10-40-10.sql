ALTER TABLE "charts" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "structs" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "model_label";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "file_path";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "access_roles";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "gr";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "hidden";--> statement-breakpoint
ALTER TABLE "charts" DROP COLUMN IF EXISTS "tiles";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "file_path";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "content";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "access_roles";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "gr";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "hidden";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "fields";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "tiles";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "date_range_includes_right_side";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "store_part";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "model_label";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "model_file_path";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "malloy_query_stable";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "malloy_query_extra";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "compiled_query";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "select";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "sortings";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "sorts";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "timezone";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "limit";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "filters";--> statement-breakpoint
ALTER TABLE "mconfigs" DROP COLUMN IF EXISTS "chart";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "roles";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "source";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "malloy_model_def";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "file_path";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "file_text";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "store_content";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "is_view_model";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "date_range_includes_right_side";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "access_roles";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "label";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "gr";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "hidden";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "fields";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "nodes";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "default_branch";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "sql";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "last_error_message";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "file_path";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "access_roles";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "fields";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "rows";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "chart";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "errors";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "metrics";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "presets";--> statement-breakpoint
ALTER TABLE "structs" DROP COLUMN IF EXISTS "mprove_config";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "ui";