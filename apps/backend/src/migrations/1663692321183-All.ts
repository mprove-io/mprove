import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663692321183 implements MigrationInterface {
  name = 'All1663692321183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `bridges` (`project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `branch_id` varchar(255) NOT NULL, `env_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `need_validate` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `repo_id`, `branch_id`, `env_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `envs` (`project_id` varchar(255) NOT NULL, `env_id` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `env_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `env_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `project_id`, `env_id`)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `connections` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD PRIMARY KEY (`connection_id`, `project_id`)'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP COLUMN `env_id`');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `struct_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('DROP TABLE `envs`');
    await queryRunner.query('DROP TABLE `bridges`');
  }
}
