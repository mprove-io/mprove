import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1616755473127 implements MigrationInterface {
  name = 'All1616755473127';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_run_ts` `last_run_ts` bigint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_cancel_ts` `last_cancel_ts` bigint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_error_ts` `last_error_ts` bigint NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_error_ts` `last_error_ts` bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_cancel_ts` `last_cancel_ts` bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `queries` CHANGE `last_run_ts` `last_run_ts` bigint NOT NULL'
    );
  }
}
