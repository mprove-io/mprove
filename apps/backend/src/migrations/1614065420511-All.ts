import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1614065420511 implements MigrationInterface {
  name = 'All1614065420511';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `branches` ADD `repo_id` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `branch_id`, `repo_id`)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `branches` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `branches` ADD PRIMARY KEY (`project_id`, `branch_id`)'
    );
    await queryRunner.query('ALTER TABLE `branches` DROP COLUMN `repo_id`');
  }
}
