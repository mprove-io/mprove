import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663757506953 implements MigrationInterface {
  name = 'All1663757506953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `bridges` (`project_id` varchar(32) NOT NULL, `repo_id` varchar(32) NOT NULL, `branch_id` varchar(32) NOT NULL, `env_id` varchar(32) NOT NULL, `struct_id` varchar(32) NOT NULL, `need_validate` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `repo_id`, `branch_id`, `env_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `envs` (`project_id` varchar(32) NOT NULL, `env_id` varchar(32) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `env_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `env_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`project_id`, `connection_id`, `env_id`)'
    );
    await queryRunner.query('ALTER TABLE `avatars` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `user_id` varchar(32) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`repo_id`, `branch_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`repo_id`, `branch_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`branch_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `repo_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `repo_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`branch_id`, `project_id`, `repo_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `repo_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `branch_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `branch_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `repo_id`, `branch_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `env_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `project_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `env_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`env_id`, `project_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `connection_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `connection_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`env_id`, `project_id`, `connection_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`dashboard_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `struct_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`dashboard_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`struct_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` DROP COLUMN `dashboard_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `dashboard_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`struct_id`, `dashboard_id`)'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD PRIMARY KEY (`idempotency_key`)'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD `user_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD PRIMARY KEY (`idempotency_key`, `user_id`)'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `struct_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `query_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `query_id` varchar(64) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `mconfig_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `mconfig_id` varchar(32) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `model_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`member_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `members` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`member_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`project_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `member_id`');
    await queryRunner.query(
      'ALTER TABLE `members` ADD `member_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`project_id`, `member_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`model_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `struct_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`model_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `model_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`struct_id`, `model_id`)'
    );
    await queryRunner.query('ALTER TABLE `notes` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `notes` DROP COLUMN `note_id`');
    await queryRunner.query(
      'ALTER TABLE `notes` ADD `note_id` varchar(32) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `owner_id`');
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `owner_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `orgs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `org_id`');
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `org_id` varchar(128) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`project_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `org_id`');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `org_id` varchar(128) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`project_id`, `org_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `connection_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `connection_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `queries` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `query_id`');
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `query_id` varchar(64) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `project_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `struct_id` varchar(32) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `users` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `users` ADD `user_id` varchar(32) NOT NULL PRIMARY KEY'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `vizs` ADD PRIMARY KEY (`viz_id`)');
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `struct_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD PRIMARY KEY (`viz_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `vizs` ADD PRIMARY KEY (`struct_id`)');
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `viz_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `viz_id` varchar(32) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD PRIMARY KEY (`struct_id`, `viz_id`)'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `model_id` varchar(32) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `model_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `vizs` ADD PRIMARY KEY (`struct_id`)');
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `viz_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `viz_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD PRIMARY KEY (`viz_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `vizs` ADD PRIMARY KEY (`viz_id`)');
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD PRIMARY KEY (`struct_id`, `viz_id`)'
    );
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `users` ADD `user_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `users` ADD PRIMARY KEY (`user_id`)');
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` ADD PRIMARY KEY (`struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `query_id`');
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `query_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD PRIMARY KEY (`query_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `connection_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `connection_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`project_id`, `org_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`project_id`)'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `org_id`');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `org_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `org_id`');
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `org_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `orgs` ADD PRIMARY KEY (`org_id`)');
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `owner_id`');
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `owner_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `notes` DROP COLUMN `note_id`');
    await queryRunner.query(
      'ALTER TABLE `notes` ADD `note_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `notes` ADD PRIMARY KEY (`note_id`)');
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `model_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`model_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`model_id`)'
    );
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `models` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `models` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `models` ADD PRIMARY KEY (`struct_id`, `model_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`project_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `member_id`');
    await queryRunner.query(
      'ALTER TABLE `members` ADD `member_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`member_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`member_id`)'
    );
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `members` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `members` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `members` ADD PRIMARY KEY (`project_id`, `member_id`)'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `model_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `model_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `mconfig_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `mconfig_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD PRIMARY KEY (`mconfig_id`)'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `query_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `query_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD PRIMARY KEY (`idempotency_key`)'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD `user_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `idemps` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD PRIMARY KEY (`idempotency_key`, `user_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`struct_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` DROP COLUMN `dashboard_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `dashboard_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`dashboard_id`, `struct_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`dashboard_id`)'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `dashboards` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD PRIMARY KEY (`struct_id`, `dashboard_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`env_id`, `project_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `connection_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `connection_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `env_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `env_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `project_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`project_id`, `connection_id`, `env_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `repo_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `branch_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `branch_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`branch_id`, `project_id`, `repo_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`branch_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `repo_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `repo_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`repo_id`, `branch_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`repo_id`, `branch_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `project_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `project_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `repo_id`, `branch_id`)'
    );
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `user_id`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `user_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD PRIMARY KEY (`user_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`project_id`, `connection_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP COLUMN `env_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('DROP TABLE `envs`');
    await queryRunner.query('DROP TABLE `bridges`');
  }
}
