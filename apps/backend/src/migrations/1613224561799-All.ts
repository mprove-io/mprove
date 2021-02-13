import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613224561799 implements MigrationInterface {
  name = 'All1613224561799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `allow_timezones` varchar(255) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `allow_timezones`'
    );
  }
}
