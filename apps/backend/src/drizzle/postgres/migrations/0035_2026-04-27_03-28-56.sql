ALTER TABLE "charts" ADD COLUMN "is_explorer" boolean;--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "charts" ADD COLUMN "chart_yaml" text;--> statement-breakpoint
ALTER TABLE "mconfigs" ADD COLUMN "session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "session_id" varchar(255);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_session_id" ON "charts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_session_id" ON "mconfigs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_session_id" ON "queries" USING btree ("session_id");