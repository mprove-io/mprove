import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1662373302974 implements MigrationInterface {
  name = 'All1662373302974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` RENAME COLUMN `postgres_query_job_id` TO `query_job_id`'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` RENAME COLUMN `query_job_id` TO `postgres_query_job_id`'
    );
  }
}
