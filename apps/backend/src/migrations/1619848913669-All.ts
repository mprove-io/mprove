import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1619848913669 implements MigrationInterface {
  name = 'All1619848913669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`)'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` CHANGE `name` `name` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`, `name`)'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` CHANGE `name` `name` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD PRIMARY KEY (`org_id`, `project_id`, `name`)'
    );
  }
}
