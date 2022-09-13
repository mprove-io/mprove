import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663072677416 implements MigrationInterface {
  name = 'All1663072677416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `remote_type` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `git_url` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `public_key` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `private_key` text NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `private_key`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `public_key`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `git_url`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `remote_type`');
  }
}
