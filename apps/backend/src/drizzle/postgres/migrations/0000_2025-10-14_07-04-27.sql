CREATE TABLE IF NOT EXISTS "avatars" (
	"user_id" varchar(32) PRIMARY KEY NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"branch_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"repo_id" varchar(32) NOT NULL,
	"branch_id" varchar(32) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
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
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "charts" (
	"chart_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"chart_id" varchar(32) NOT NULL,
	"model_id" varchar(64) NOT NULL,
	"creator_id" varchar(32),
	"chart_type" varchar,
	"draft" boolean,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connections" (
	"connection_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"connection_id" varchar(32) NOT NULL,
	"type" varchar NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboards" (
	"dashboard_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"dashboard_id" varchar(32) NOT NULL,
	"creator_id" varchar(32),
	"draft" boolean NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dconfigs" (
	"dconfig_id" varchar(32) PRIMARY KEY NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "envs" (
	"env_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"env_id" varchar(32) NOT NULL,
	"member_ids" json DEFAULT '[]'::json,
	"is_fallback_to_prod_connections" boolean DEFAULT false,
	"is_fallback_to_prod_variables" boolean DEFAULT false,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kits" (
	"kit_id" varchar(32) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"report_id" varchar(32) NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mconfigs" (
	"mconfig_id" varchar(32) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"query_id" varchar(64) NOT NULL,
	"model_id" varchar(64) NOT NULL,
	"model_type" varchar,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"member_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"member_id" varchar(32) NOT NULL,
	"is_admin" boolean NOT NULL,
	"is_editor" boolean NOT NULL,
	"is_explorer" boolean NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"email_hash" varchar NOT NULL,
	"alias_hash" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"model_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"model_id" varchar(64) NOT NULL,
	"type" varchar,
	"connection_id" varchar,
	"connection_type" varchar,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"note_id" varchar(32) PRIMARY KEY NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orgs" (
	"org_id" varchar(128) PRIMARY KEY NOT NULL,
	"owner_id" varchar NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"name_hash" varchar NOT NULL,
	"owner_email_hash" varchar NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"project_id" varchar(32) PRIMARY KEY NOT NULL,
	"org_id" varchar(128) NOT NULL,
	"remote_type" varchar NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"name_hash" varchar NOT NULL,
	"git_url_hash" varchar,
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
	"status" varchar NOT NULL,
	"last_run_by" varchar,
	"last_run_ts" bigint,
	"last_cancel_ts" bigint,
	"last_complete_ts" bigint,
	"last_complete_duration" bigint,
	"last_error_ts" bigint,
	"bigquery_consecutive_errors_get_job" integer,
	"bigquery_consecutive_errors_get_results" integer,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"api_url_hash" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"report_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"struct_id" varchar(32) NOT NULL,
	"report_id" varchar(32) NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"creator_id" varchar(32),
	"draft" boolean NOT NULL,
	"draft_created_ts" bigint NOT NULL,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "structs" (
	"struct_id" varchar(32) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"mprove_version" varchar,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar(32) PRIMARY KEY NOT NULL,
	"is_email_verified" boolean NOT NULL,
	"jwt_min_iat" bigint,
	"st" json NOT NULL,
	"lt" json NOT NULL,
	"key_tag" text,
	"email_hash" varchar NOT NULL,
	"alias_hash" varchar,
	"email_verification_token_hash" varchar NOT NULL,
	"password_reset_token_hash" varchar,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avatars_server_ts" ON "avatars" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avatars_key_tag" ON "avatars" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_server_ts" ON "branches" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_project_id" ON "branches" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_repo_id" ON "branches" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_branch_id" ON "branches" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_key_tag" ON "branches" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_branches_project_id_repo_id_branch_id" ON "branches" USING btree ("project_id","repo_id","branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_server_ts" ON "bridges" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_project_id" ON "bridges" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_repo_id" ON "bridges" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_branch_id" ON "bridges" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_env_id" ON "bridges" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_struct_id" ON "bridges" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bridges_key_tag" ON "bridges" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_bridges_project_id_repo_id_branch_id_env_id" ON "bridges" USING btree ("project_id","repo_id","branch_id","env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_server_ts" ON "charts" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_struct_id" ON "charts" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_chart_id" ON "charts" USING btree ("chart_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_model_id" ON "charts" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_charts_key_tag" ON "charts" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_charts_struct_id_chart_id" ON "charts" USING btree ("struct_id","chart_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_server_ts" ON "connections" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_project_id" ON "connections" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_env_id" ON "connections" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_connection_id" ON "connections" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connections_key_tag" ON "connections" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_connections_project_id_env_id_connection_id" ON "connections" USING btree ("project_id","env_id","connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_server_ts" ON "dashboards" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_struct_id" ON "dashboards" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_dashboard_id" ON "dashboards" USING btree ("dashboard_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboards_key_tag" ON "dashboards" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_dashboards_struct_id_dashboard_id" ON "dashboards" USING btree ("struct_id","dashboard_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dconfigs_server_ts" ON "dconfigs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dconfigs_key_tag" ON "dconfigs" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_server_ts" ON "envs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_project_id" ON "envs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_env_id" ON "envs" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_envs_key_tag" ON "envs" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_envs_project_id_env_id" ON "envs" USING btree ("project_id","env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_server_ts" ON "kits" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_struct_id" ON "kits" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_report_id" ON "kits" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kits_key_tag" ON "kits" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_server_ts" ON "mconfigs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_struct_id" ON "mconfigs" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_query_id" ON "mconfigs" USING btree ("query_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mconfigs_key_tag" ON "mconfigs" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_server_ts" ON "members" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_project_id" ON "members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_member_id" ON "members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_email_hash" ON "members" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_alias_hash" ON "members" USING btree ("alias_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_key_tag" ON "members" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_members_project_id_member_id" ON "members" USING btree ("project_id","member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_server_ts" ON "models" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_struct_id" ON "models" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_model_id" ON "models" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_models_key_tag" ON "models" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_models_struct_id_model_id" ON "models" USING btree ("struct_id","model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notes_server_ts" ON "notes" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notes_key_tag" ON "notes" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_owner_id" ON "orgs" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_owner_email_hash" ON "orgs" USING btree ("owner_email_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_key_tag" ON "orgs" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_orgs_name_hash" ON "orgs" USING btree ("name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_name_hash" ON "projects" USING btree ("name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_git_url_hash" ON "projects" USING btree ("git_url_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_key_tag" ON "projects" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_projects_org_id_name_hash" ON "projects" USING btree ("org_id","name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_server_ts" ON "queries" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_project_id" ON "queries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_env_id" ON "queries" USING btree ("env_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_connection_id" ON "queries" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_query_job_id" ON "queries" USING btree ("query_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_bigquery_query_job_id" ON "queries" USING btree ("bigquery_query_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_api_url_hash" ON "queries" USING btree ("api_url_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_key_tag" ON "queries" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_server_ts" ON "reports" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_struct_id" ON "reports" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_report_id" ON "reports" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_project_id" ON "reports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reports_key_tag" ON "reports" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_reports_struct_id_report_id" ON "reports" USING btree ("struct_id","report_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_structs_server_ts" ON "structs" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_structs_project_id" ON "structs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_structs_key_tag" ON "structs" USING btree ("key_tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_server_ts" ON "users" USING btree ("server_ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_key_tag" ON "users" USING btree ("key_tag");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email_hash" ON "users" USING btree ("email_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_alias_hash" ON "users" USING btree ("alias_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email_verification_token_hash" ON "users" USING btree ("email_verification_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_password_reset_token_hash" ON "users" USING btree ("password_reset_token_hash");