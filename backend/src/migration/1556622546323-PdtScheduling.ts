import { MigrationInterface, QueryRunner } from 'typeorm';

export class PdtScheduling1556622546323 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_time` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_time_job_id` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_need_start_by_time` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_sql` mediumtext NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_sql_value` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_sql_bigquery_query_job_id` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_sql_last_error_message` mediumtext NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_sql_last_error_message`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_sql_bigquery_query_job_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_sql_value`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_sql`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_need_start_by_time`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_time_job_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_time`'
    );
  }
}
