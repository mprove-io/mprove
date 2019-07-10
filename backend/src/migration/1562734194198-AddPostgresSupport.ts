import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostgresSupport1562734194198 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      // tslint:disable-next-line:quotemark
      "ALTER TABLE `m_project` ADD `connection` varchar(255) NOT NULL DEFAULT 'bigquery'"
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` ADD `postgres_host` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` ADD `postgres_port` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` ADD `postgres_database` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` ADD `postgres_user` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` ADD `postgres_password` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `postgres_query_job_id` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_trigger_sql_postgres_query_job_id` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `pdt_need_start_by_trigger_sql` varchar(255) NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_need_start_by_trigger_sql`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `pdt_trigger_sql_postgres_query_job_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_query` DROP COLUMN `postgres_query_job_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` DROP COLUMN `postgres_password`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` DROP COLUMN `postgres_user`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` DROP COLUMN `postgres_database`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` DROP COLUMN `postgres_port`'
    );
    await queryRunner.query(
      'ALTER TABLE `m_project` DROP COLUMN `postgres_host`'
    );
    await queryRunner.query('ALTER TABLE `m_project` DROP COLUMN `connection`');
  }
}
