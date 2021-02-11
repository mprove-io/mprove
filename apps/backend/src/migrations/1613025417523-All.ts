import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613025417523 implements MigrationInterface {
  name = 'All1613025417523';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `branches` (`struct_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `branch_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `branch_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `vizs` (`struct_id` varchar(255) NOT NULL, `viz_id` varchar(255) NOT NULL, `access_users` json NOT NULL, `access_roles` json NOT NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `reports` json NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`struct_id`, `viz_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `members` ADD `email` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `members` ADD UNIQUE INDEX `IDX_2714af51e3f7dd42cf66eeb08d` (`email`)'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `content` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `access_users` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `access_roles` json NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `dashboards` ADD `title` text NULL');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `gr` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `hidden` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `fields` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `reports` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `temp` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `description` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `model_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `select` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `sortings` json NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `sorts` json NOT NULL');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `timezone` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `limit` int NOT NULL');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `filters` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `charts` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `temp` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` ADD `content` json NOT NULL');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `access_users` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `models` ADD `access_roles` json NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `models` ADD `label` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` ADD `gr` varchar(255) NULL');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `hidden` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` ADD `fields` json NOT NULL');
    await queryRunner.query('ALTER TABLE `models` ADD `nodes` json NOT NULL');
    await queryRunner.query('ALTER TABLE `models` ADD `description` text NULL');
    await queryRunner.query('ALTER TABLE `structs` ADD `errors` text NOT NULL');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `udfs_dict` text NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `udfs_dict`');
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `errors`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `description`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `nodes`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `fields`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `hidden`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `gr`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `label`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `access_roles`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `access_users`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `content`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `temp`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `charts`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `filters`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `limit`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `timezone`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `sorts`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `sortings`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `select`');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `dashboards` DROP COLUMN `description`'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `temp`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `reports`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `fields`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `hidden`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `gr`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `title`');
    await queryRunner.query(
      'ALTER TABLE `dashboards` DROP COLUMN `access_roles`'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` DROP COLUMN `access_users`'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `content`');
    await queryRunner.query(
      'ALTER TABLE `members` DROP INDEX `IDX_2714af51e3f7dd42cf66eeb08d`'
    );
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `email`');
    await queryRunner.query('DROP TABLE `vizs`');
    await queryRunner.query('DROP TABLE `branches`');
  }
}
