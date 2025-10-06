DROP INDEX IF EXISTS "idx_orgs_owner_email";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_orgs_name";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_projects_org_id_name";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_users_email";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_users_alias";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_users_email_verification_token";--> statement-breakpoint
DROP INDEX IF EXISTS "uidx_users_password_reset_token";--> statement-breakpoint
ALTER TABLE "orgs" ALTER COLUMN "owner_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "default_branch" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "remote_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "avatars" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "envs" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "kits" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "email_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "alias_hash" varchar;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "name_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "owner_email_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "name_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "git_url_hash" varchar;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "api_url_hash" varchar;--> statement-breakpoint
ALTER TABLE "queries" ADD COLUMN "tab" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "alias_hash" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_hash" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tab" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_email_hash" ON "members" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_alias_hash" ON "members" USING btree ("alias_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orgs_owner_email_hash" ON "orgs" USING btree ("owner_email_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_orgs_name_hash" ON "orgs" USING btree ("name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_name_hash" ON "projects" USING btree ("name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_git_url_hash" ON "projects" USING btree ("git_url_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_projects_org_id_name_hash" ON "projects" USING btree ("org_id","name_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_queries_api_url_hash" ON "queries" USING btree ("api_url_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email_hash" ON "users" USING btree ("email_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_alias_hash" ON "users" USING btree ("alias_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_email_verification_token_hash" ON "users" USING btree ("email_verification_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_users_password_reset_token_hash" ON "users" USING btree ("password_reset_token_hash");--> statement-breakpoint
ALTER TABLE "avatars" DROP COLUMN IF EXISTS "avatar_small";--> statement-breakpoint
ALTER TABLE "avatars" DROP COLUMN IF EXISTS "avatar_big";--> statement-breakpoint
ALTER TABLE "envs" DROP COLUMN IF EXISTS "evs";--> statement-breakpoint
ALTER TABLE "kits" DROP COLUMN IF EXISTS "data";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "email";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "alias";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "first_name";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "last_name";--> statement-breakpoint
ALTER TABLE "orgs" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "orgs" DROP COLUMN IF EXISTS "owner_email";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "git_url";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "api_method";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "api_url";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "api_body";--> statement-breakpoint
ALTER TABLE "queries" DROP COLUMN IF EXISTS "data";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "alias";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_expires_ts";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "jwt_min_iat";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_name";