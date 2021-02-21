import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613893265044 implements MigrationInterface {
  name = 'All1613893265044';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `allow_timezones`'
    );
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `timezone`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `week_start`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `week_start` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `allow_timezones` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `default_timezone` varchar(255) NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `structs` DROP COLUMN `default_timezone`'
    );
    await queryRunner.query(
      'ALTER TABLE `structs` DROP COLUMN `allow_timezones`'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `week_start`');
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `week_start` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `timezone` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `allow_timezones` varchar(255) NOT NULL'
    );
  }
}
