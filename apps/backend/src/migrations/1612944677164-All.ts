import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1612944677164 implements MigrationInterface {
  name = 'All1612944677164';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `connections` (`project_id` varchar(255) NOT NULL, `connection_id` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `bigquery_project` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `connection_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `members` (`project_id` varchar(255) NOT NULL, `member_id` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `avatar_url_small` varchar(255) NULL, `avatar_url_big` varchar(255) NULL, `timezone` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `is_editor` varchar(255) NOT NULL, `is_admin` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_1977502cf06b3005768826e1e3` (`alias`), PRIMARY KEY (`project_id`, `member_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `organizations` (`organization_id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`organization_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `projects` (`organization_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `week_start` varchar(255) NOT NULL, `timezone` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `dashboards` (`struct_id` varchar(255) NOT NULL, `dashboard_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `dashboard_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `errors` (`struct_id` varchar(255) NOT NULL, `error_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`error_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `mconfigs` (`struct_id` varchar(255) NOT NULL, `query_id` varchar(255) NOT NULL, `mconfig_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`mconfig_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `models` (`struct_id` varchar(255) NOT NULL, `model_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `model_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `queries` (`struct_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `connection_id` varchar(255) NOT NULL, `query_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`query_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `structs` (`project_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `views` (`struct_id` varchar(255) NOT NULL, `view_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `view_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `visualizations` (`struct_id` varchar(255) NOT NULL, `visualization_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `visualization_id`)) ENGINE=InnoDB'
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
    await queryRunner.query('DROP TABLE `visualizations`');
    await queryRunner.query('DROP TABLE `views`');
    await queryRunner.query('DROP TABLE `structs`');
    await queryRunner.query('DROP TABLE `queries`');
    await queryRunner.query('DROP TABLE `models`');
    await queryRunner.query('DROP TABLE `mconfigs`');
    await queryRunner.query('DROP TABLE `errors`');
    await queryRunner.query('DROP TABLE `dashboards`');
    await queryRunner.query('DROP TABLE `projects`');
    await queryRunner.query('DROP TABLE `organizations`');
    await queryRunner.query(
      'DROP INDEX `IDX_1977502cf06b3005768826e1e3` ON `members`'
    );
    await queryRunner.query('DROP TABLE `members`');
    await queryRunner.query('DROP TABLE `connections`');
  }
}
