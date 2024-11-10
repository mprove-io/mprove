CREATE TABLE IF NOT EXISTS "avatars" (
	"user_id" varchar(32) PRIMARY KEY NOT NULL,
	"avatar_small" text,
	"avatar_big" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"branch_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"repo_id" varchar(32) NOT NULL,
	"branch_id" varchar(32) NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bridges" (
	"bridge_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"repo_id" varchar(32) NOT NULL,
	"branch_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"need_validate" boolean NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connections" (
	"connection_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"connection_id" varchar(32) NOT NULL,
	"type" varchar NOT NULL,
	"bigquery_query_size_limit_gb" integer,
	"bigquery_credentials" json,
	"bigquery_project" varchar,
	"bigquery_client_email" varchar,
	"account" varchar,
	"warehouse" varchar,
	"host" varchar,
	"port" integer,
	"database" varchar,
	"username" varchar,
	"password" varchar,
	"is_ssl" boolean,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboards" (
	"dashboard_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"dashboard_id" varchar(32) NOT NULL,
	"file_path" varchar,
	"content" json NOT NULL,
	"access_users" json NOT NULL,
	"access_roles" json NOT NULL,
	"title" varchar,
	"gr" varchar,
	"hidden" boolean NOT NULL,
	"fields" json NOT NULL,
	"tiles" json NOT NULL,
	"temp" boolean NOT NULL,
	"description" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "envs" (
	"env_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evs" (
	"ev_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"ev_id" varchar(32) NOT NULL,
	"val" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kits" (
	"kit_id" varchar(32) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"report_id" varchar(32) NOT NULL,
	"data" json,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mconfigs" (
	"mconfig_id" varchar(32) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"query_id" varchar(64) NOT NULL,
	"model_id" varchar(32) NOT NULL,
	"model_label" varchar,
	"select" json NOT NULL,
	"sortings" json NOT NULL,
	"sorts" varchar,
	"timezone" varchar NOT NULL,
	"limit" integer NOT NULL,
	"filters" json NOT NULL,
	"chart" json NOT NULL,
	"temp" boolean NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"member_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"member_id" varchar(32) NOT NULL,
	"email" varchar NOT NULL,
	"alias" varchar,
	"roles" json NOT NULL,
	"envs" json NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"timezone" varchar NOT NULL,
	"is_admin" boolean NOT NULL,
	"is_editor" boolean NOT NULL,
	"is_explorer" boolean NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics" (
	"metric_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"metric_id" varchar NOT NULL,
	"top_node" varchar NOT NULL,
	"part_id" varchar NOT NULL,
	"file_path" varchar NOT NULL,
	"type" varchar NOT NULL,
	"label" varchar NOT NULL,
	"top_label" varchar NOT NULL,
	"part_node_label" varchar NOT NULL,
	"part_field_label" varchar NOT NULL,
	"part_label" varchar NOT NULL,
	"time_node_label" varchar NOT NULL,
	"time_field_label" varchar NOT NULL,
	"time_label" varchar NOT NULL,
	"params" json NOT NULL,
	"model_id" varchar,
	"timefield_id" varchar,
	"field_id" varchar,
	"field_class" varchar,
	"formula" varchar,
	"sql" varchar,
	"connection_id" varchar,
	"description" varchar,
	"format_number" varchar,
	"currency_prefix" varchar,
	"currency_suffix" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"model_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"model_id" varchar(32) NOT NULL,
	"connection_id" varchar,
	"file_path" varchar,
	"content" json NOT NULL,
	"access_users" json NOT NULL,
	"access_roles" json NOT NULL,
	"label" varchar NOT NULL,
	"gr" varchar,
	"hidden" boolean NOT NULL,
	"fields" json NOT NULL,
	"nodes" json NOT NULL,
	"description" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"note_id" varchar(32) PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orgs" (
	"org_id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"owner_email" text NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"project_id" varchar(32) PRIMARY KEY NOT NULL,
	"org_id" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"default_branch" text DEFAULT 'master' NOT NULL,
	"remote_type" varchar DEFAULT 'Managed' NOT NULL,
	"git_url" varchar,
	"public_key" text,
	"private_key" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queries" (
	"query_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"connection_id" varchar(32) NOT NULL,
	"connection_type" varchar NOT NULL,
	"query_job_id" varchar,
	"bigquery_query_job_id" varchar,
	"sql" text,
	"status" varchar NOT NULL,
	"data" json,
	"last_run_by" varchar,
	"last_run_ts" bigint,
	"last_cancel_ts" bigint,
	"last_complete_ts" bigint,
	"last_complete_duration" bigint,
	"last_error_ts" bigint,
	"last_error_message" text,
	"bigquery_consecutive_errors_get_job" integer,
	"bigquery_consecutive_errors_get_results" integer,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"report_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"report_id" varchar(32) NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"creator_id" varchar(32),
	"file_path" varchar,
	"access_users" json NOT NULL,
	"access_roles" json NOT NULL,
	"title" varchar NOT NULL,
	"rows" json NOT NULL,
	"draft" boolean NOT NULL,
	"draft_created_ts" bigint NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "structs" (
	"struct_id" varchar(32) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"mprove_dir_value" varchar,
	"week_start" varchar NOT NULL,
	"allow_timezones" boolean NOT NULL,
	"default_timezone" varchar NOT NULL,
	"format_number" varchar,
	"currency_prefix" varchar,
	"currency_suffix" varchar,
	"errors" json NOT NULL,
	"views" json NOT NULL,
	"udfs_dict" json NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar(32) PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"alias" varchar,
	"is_email_verified" boolean NOT NULL,
	"email_verification_token" varchar NOT NULL,
	"password_reset_token" varchar,
	"password_reset_expires_ts" bigint,
	"hash" varchar,
	"salt" varchar,
	"jwt_min_iat" bigint,
	"first_name" varchar,
	"last_name" varchar,
	"timezone" varchar NOT NULL,
	"ui" json,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vizs" (
	"viz_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"viz_id" varchar(32) NOT NULL,
	"title" varchar NOT NULL,
	"model_id" varchar(32) NOT NULL,
	"model_label" varchar NOT NULL,
	"file_path" varchar,
	"access_users" json NOT NULL,
	"access_roles" json NOT NULL,
	"gr" varchar,
	"hidden" boolean NOT NULL,
	"tiles" json NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avatars_server_ts" ON "avatars" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_server_ts" ON "branches" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_project_id" ON "branches" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_repo_id" ON "branches" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_branch_id" ON "branches" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_branches_project_id_repo_id_branch_id" ON "branches" USING btree ("project_id","repo_id","branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_server_ts" ON "bridges" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_project_id" ON "bridges" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_repo_id" ON "bridges" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_branch_id" ON "bridges" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_env_id" ON "bridges" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_struct_id" ON "bridges" USING btree ("struct_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_bridges_project_id_repo_id_branch_id_env_id" ON "bridges" USING btree ("project_id","repo_id","branch_id","env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_server_ts" ON "connections" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_project_id" ON "connections" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_env_id" ON "connections" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_connection_id" ON "connections" USING btree ("connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_connections_project_id_env_id_connection_id" ON "connections" USING btree ("project_id","env_id","connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_server_ts" ON "dashboards" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_struct_id" ON "dashboards" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_dashboard_id" ON "dashboards" USING btree ("dashboard_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_dashboards_struct_id_dashboard_id" ON "dashboards" USING btree ("struct_id","dashboard_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_server_ts" ON "envs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_project_id" ON "envs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_env_id" ON "envs" USING btree ("env_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_envs_project_id_env_id" ON "envs" USING btree ("project_id","env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evs_server_ts" ON "evs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evs_project_id" ON "evs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evs_env_id" ON "evs" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evs_ev_id" ON "evs" USING btree ("ev_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_evs_project_id_env_id_ev_id" ON "evs" USING btree ("project_id","env_id","ev_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_server_ts" ON "kits" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_struct_id" ON "kits" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_report_id" ON "kits" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_server_ts" ON "mconfigs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_struct_id" ON "mconfigs" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_query_id" ON "mconfigs" USING btree ("query_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_server_ts" ON "members" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_project_id" ON "members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_member_id" ON "members" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_members_project_id_member_id" ON "members" USING btree ("project_id","member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_server_ts" ON "metrics" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_struct_id" ON "metrics" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_metric_id" ON "metrics" USING btree ("metric_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_metrics_struct_id_metric_id" ON "metrics" USING btree ("struct_id","metric_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_server_ts" ON "models" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_struct_id" ON "models" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_model_id" ON "models" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_models_struct_id_model_id" ON "models" USING btree ("struct_id","model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_owner_id" ON "orgs" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_owner_email" ON "orgs" USING btree ("owner_email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_orgs_name" ON "orgs" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_projects_org_id_name" ON "projects" USING btree ("org_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_server_ts" ON "queries" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_project_id" ON "queries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_env_id" ON "queries" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_connection_id" ON "queries" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_query_job_id" ON "queries" USING btree ("query_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_bigquery_query_job_id" ON "queries" USING btree ("bigquery_query_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_server_ts" ON "reports" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_struct_id" ON "reports" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_report_id" ON "reports" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_project_id" ON "reports" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_reports_struct_id_report_id" ON "reports" USING btree ("struct_id","report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_structs_server_ts" ON "structs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_structs_project_id" ON "structs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_server_ts" ON "users" USING btree ("server_ts");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_alias" ON "users" USING btree ("alias");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email_verification_token" ON "users" USING btree ("email_verification_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_password_reset_token" ON "users" USING btree ("password_reset_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vizs_server_ts" ON "vizs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vizs_struct_id" ON "vizs" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vizs_viz_id" ON "vizs" USING btree ("viz_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vizs_model_id" ON "vizs" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_vizs_struct_id_viz_id" ON "vizs" USING btree ("struct_id","viz_id");