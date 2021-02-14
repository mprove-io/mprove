import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613279659407 implements MigrationInterface {
  name = 'All1613279659407';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`, `name`)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`project_id`)'
    );
  }
}
