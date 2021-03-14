import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615704275544 implements MigrationInterface {
  name = 'All1615704275544';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_credentials_file_path`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_credentials`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_credentials` json NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_credentials`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_credentials` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_credentials_file_path` varchar(255) NULL'
    );
  }
}
