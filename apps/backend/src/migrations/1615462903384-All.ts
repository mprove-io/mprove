import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615462903384 implements MigrationInterface {
  name = 'All1615462903384';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `data`');
    await queryRunner.query('ALTER TABLE `queries` ADD `data` json NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `data`');
    await queryRunner.query('ALTER TABLE `queries` ADD `data` mediumtext NULL');
  }
}
