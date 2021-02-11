import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613047418935 implements MigrationInterface {
  name = 'All1613047418935';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `branches` (`struct_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `branch_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `branch_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `connections` (`project_id` varchar(255) NOT NULL, `connection_id` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `bigquery_project` varchar(255) NULL, `bigquery_client_email` varchar(255) NULL, `bigquery_credentials` text NULL, `bigquery_credentials_file_path` varchar(255) NULL, `bigquery_query_size_limit` int NULL, `postgres_host` varchar(255) NULL, `postgres_port` int NULL, `postgres_database` varchar(255) NULL, `postgres_user` varchar(255) NULL, `postgres_password` varchar(255) NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `connection_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `members` (`project_id` varchar(255) NOT NULL, `member_id` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `avatar_url_small` varchar(255) NULL, `avatar_url_big` varchar(255) NULL, `timezone` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `is_editor` varchar(255) NOT NULL, `is_admin` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_2714af51e3f7dd42cf66eeb08d` (`email`), UNIQUE INDEX `IDX_1977502cf06b3005768826e1e3` (`alias`), PRIMARY KEY (`project_id`, `member_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `orgs` (`organization_id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_e9066f92474bd063a2d45b5b7e` (`name`), PRIMARY KEY (`organization_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `projects` (`organization_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `week_start` varchar(255) NOT NULL, `timezone` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `dashboards` (`struct_id` varchar(255) NOT NULL, `dashboard_id` varchar(255) NOT NULL, `content` json NOT NULL, `access_users` json NOT NULL, `access_roles` json NOT NULL, `title` text NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `fields` json NOT NULL, `reports` json NOT NULL, `temp` varchar(255) NOT NULL, `description` text NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `dashboard_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `mconfigs` (`struct_id` varchar(255) NOT NULL, `query_id` varchar(255) NOT NULL, `mconfig_id` varchar(255) NOT NULL, `model_id` varchar(255) NOT NULL, `select` json NOT NULL, `sortings` json NOT NULL, `sorts` text NOT NULL, `timezone` varchar(255) NOT NULL, `limit` int NOT NULL, `filters` json NOT NULL, `charts` json NOT NULL, `temp` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`mconfig_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `models` (`struct_id` varchar(255) NOT NULL, `model_id` varchar(255) NOT NULL, `content` json NOT NULL, `access_users` json NOT NULL, `access_roles` json NOT NULL, `label` varchar(255) NOT NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `fields` json NOT NULL, `nodes` json NOT NULL, `description` text NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `model_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `queries` (`project_id` varchar(255) NOT NULL, `connection_id` varchar(255) NOT NULL, `query_id` varchar(255) NOT NULL, `sql` mediumtext NULL, `data` mediumtext NULL, `status` varchar(255) NOT NULL, `last_run_by` varchar(255) NULL, `last_run_ts` bigint NOT NULL, `last_cancel_ts` bigint NOT NULL, `last_complete_ts` bigint NULL, `last_complete_duration` bigint NULL, `last_error_message` mediumtext NULL, `last_error_ts` bigint NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`query_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `structs` (`project_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `errors` json NOT NULL, `udfs_dict` json NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `views` (`struct_id` varchar(255) NOT NULL, `view_id` varchar(255) NOT NULL, `view_deps` json NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `view_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `vizs` (`struct_id` varchar(255) NOT NULL, `viz_id` varchar(255) NOT NULL, `access_users` json NOT NULL, `access_roles` json NOT NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `reports` json NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `viz_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `users` (`user_id` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `alias` varchar(255) NULL, `is_email_verified` varchar(255) NOT NULL, `email_verification_token` varchar(255) NOT NULL, `password_reset_token` varchar(255) NULL, `password_reset_expires_ts` bigint NULL, `hash` varchar(255) NULL, `salt` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `avatar_url_small` varchar(255) NULL, `avatar_url_big` varchar(255) NULL, `timezone` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), UNIQUE INDEX `IDX_f002c336d3299ee4eba0019690` (`alias`), UNIQUE INDEX `IDX_baf4ca2a5aa907023a2f3748be` (`email_verification_token`), UNIQUE INDEX `IDX_c0d176bcc1665dc7cb60482c81` (`password_reset_token`), PRIMARY KEY (`user_id`)) ENGINE=InnoDB'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_c0d176bcc1665dc7cb60482c81` ON `users`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_baf4ca2a5aa907023a2f3748be` ON `users`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_f002c336d3299ee4eba0019690` ON `users`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`'
    );
    await queryRunner.query('DROP TABLE `users`');
    await queryRunner.query('DROP TABLE `vizs`');
    await queryRunner.query('DROP TABLE `views`');
    await queryRunner.query('DROP TABLE `structs`');
    await queryRunner.query('DROP TABLE `queries`');
    await queryRunner.query('DROP TABLE `models`');
    await queryRunner.query('DROP TABLE `mconfigs`');
    await queryRunner.query('DROP TABLE `dashboards`');
    await queryRunner.query('DROP TABLE `projects`');
    await queryRunner.query(
      'DROP INDEX `IDX_e9066f92474bd063a2d45b5b7e` ON `orgs`'
    );
    await queryRunner.query('DROP TABLE `orgs`');
    await queryRunner.query(
      'DROP INDEX `IDX_1977502cf06b3005768826e1e3` ON `members`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_2714af51e3f7dd42cf66eeb08d` ON `members`'
    );
    await queryRunner.query('DROP TABLE `members`');
    await queryRunner.query('DROP TABLE `connections`');
    await queryRunner.query('DROP TABLE `branches`');
  }
}
