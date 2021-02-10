import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1612965995399 implements MigrationInterface {
  name = 'All1612965995399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `struct_id`');
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_client_email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_credentials` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_credentials_file_path` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `bigquery_query_size_limit` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `postgres_host` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `postgres_port` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `postgres_database` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `postgres_user` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `postgres_password` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `errors` ADD `type` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `errors` ADD `message` text NOT NULL');
    await queryRunner.query('ALTER TABLE `errors` ADD `lines` text NOT NULL');
    await queryRunner.query('ALTER TABLE `queries` ADD `sql` mediumtext NULL');
    await queryRunner.query('ALTER TABLE `queries` ADD `data` mediumtext NULL');
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `status` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_run_by` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_run_ts` bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_cancel_ts` bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_complete_ts` bigint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_complete_duration` bigint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_error_message` mediumtext NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `last_error_ts` bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `views` ADD `view_deps` text NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` CHANGE `bigquery_project` `bigquery_project` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` CHANGE `bigquery_project` `bigquery_project` varchar(255) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `views` DROP COLUMN `view_deps`');
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `last_error_ts`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `last_error_message`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `last_complete_duration`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `last_complete_ts`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `last_cancel_ts`'
    );
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `last_run_ts`');
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `last_run_by`');
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `status`');
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `data`');
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `sql`');
    await queryRunner.query('ALTER TABLE `errors` DROP COLUMN `lines`');
    await queryRunner.query('ALTER TABLE `errors` DROP COLUMN `message`');
    await queryRunner.query('ALTER TABLE `errors` DROP COLUMN `type`');
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `postgres_password`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `postgres_user`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `postgres_database`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `postgres_port`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `postgres_host`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_query_size_limit`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_credentials_file_path`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_credentials`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `bigquery_client_email`'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `struct_id` varchar(255) NOT NULL'
    );
  }
}
