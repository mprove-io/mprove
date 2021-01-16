import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1610547795476 implements MigrationInterface {
  name = 'User1610547795476';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` ADD `server_ts` bigint NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `server_ts`');
  }
}
