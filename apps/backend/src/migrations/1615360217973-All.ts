import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615360217973 implements MigrationInterface {
  name = 'All1615360217973';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `dashboards` ADD `file_path` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `models` ADD `file_path` text NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `vizs` ADD `file_path` text NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `file_path`');
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `file_path`');
    await queryRunner.query('ALTER TABLE `dashboards` DROP COLUMN `file_path`');
  }
}
