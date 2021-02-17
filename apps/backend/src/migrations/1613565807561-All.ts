import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613565807561 implements MigrationInterface {
  name = 'All1613565807561';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `company_size` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `contact_phone` varchar(255) NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `contact_phone`');
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `company_size`');
  }
}
