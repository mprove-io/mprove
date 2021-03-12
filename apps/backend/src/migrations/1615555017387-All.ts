import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615555017387 implements MigrationInterface {
  name = 'All1615555017387';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `postgres_query_job_id` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `bigquery_query_job_id` varchar(255) NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `bigquery_query_job_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `postgres_query_job_id`'
    );
  }
}
