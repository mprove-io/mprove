import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1616486053188 implements MigrationInterface {
  name = 'All1616486053188';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` CHANGE `bigquery_query_size_limit` `bigquery_query_size_limit_gb` int NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` CHANGE `bigquery_query_size_limit_gb` `bigquery_query_size_limit` int NULL'
    );
  }
}
