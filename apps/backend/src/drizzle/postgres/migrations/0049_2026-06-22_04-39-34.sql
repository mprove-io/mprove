CREATE TABLE IF NOT EXISTS "favorites" (
	"favorite_full_id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(32) NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"type" varchar NOT NULL,
	"target_id" varchar(32) NOT NULL,
	"server_ts" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favorites_project_id" ON "favorites" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favorites_user_id" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favorites_target_id" ON "favorites" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favorites_server_ts" ON "favorites" USING btree ("server_ts");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_favorites_user_project_type_target" ON "favorites" USING btree ("user_id","project_id","type","target_id");