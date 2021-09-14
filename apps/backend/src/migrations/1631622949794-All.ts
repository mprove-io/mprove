import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1631622949794 implements MigrationInterface {
  name = 'All1631622949794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `format_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `currency_prefix` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `currency_suffix` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `structs` DROP COLUMN `currency_suffix`'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` DROP COLUMN `currency_prefix`'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` DROP COLUMN `format_number`'
    );
  }
}
