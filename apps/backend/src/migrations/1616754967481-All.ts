import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1616754967481 implements MigrationInterface {
  name = 'All1616754967481';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `bigquery_consecutive_errors_get_job` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `bigquery_consecutive_errors_get_results` int NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `bigquery_consecutive_errors_get_results`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `bigquery_consecutive_errors_get_job`'
    );
  }
}
