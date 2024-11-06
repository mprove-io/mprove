DROP INDEX IF EXISTS "uidx_reports_project_id_struct_id_report_id";--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "branch_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "connections" ALTER COLUMN "connection_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "dashboard_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "envs" ALTER COLUMN "env_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "evs" ALTER COLUMN "ev_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "member_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "metrics" ALTER COLUMN "metric_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "models" ALTER COLUMN "model_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "report_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "vizs" ALTER COLUMN "viz_full_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "bridges" ADD COLUMN "bridge_full_id" varchar(32) PRIMARY KEY NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_reports_struct_id_report_id" ON "reports" USING btree ("struct_id","report_id");--> statement-breakpoint
ALTER TABLE "bridges" DROP COLUMN IF EXISTS "bridge_id";