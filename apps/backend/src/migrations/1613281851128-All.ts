import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613281851128 implements MigrationInterface {
  name = 'All1613281851128';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `members` ADD `is_explorer` varchar(255) NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `is_explorer`');
  }
}
