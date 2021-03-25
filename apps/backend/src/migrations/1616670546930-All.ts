import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1616670546930 implements MigrationInterface {
  name = 'All1616670546930';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `request`');
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `response`');
    await queryRunner.query('ALTER TABLE `idemps` ADD `req` json NOT NULL');
    await queryRunner.query('ALTER TABLE `idemps` ADD `resp` json NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `resp`');
    await queryRunner.query('ALTER TABLE `idemps` DROP COLUMN `req`');
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD `response` mediumtext NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `idemps` ADD `request` mediumtext NOT NULL'
    );
  }
}
