ALTER TABLE "mconfigs" ADD COLUMN "unsafe_select" json;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "warn_select" json;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "join_aggregations" json;--> statement-breakpoint
ALTER TABLE "structs" ADD COLUMN "simplify_safe_aggregates" boolean;