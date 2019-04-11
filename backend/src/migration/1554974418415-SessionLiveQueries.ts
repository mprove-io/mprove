import { MigrationInterface, QueryRunner } from 'typeorm';

export class SessionLiveQueries1554974418415 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_session` ADD `live_queries` text NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_session` DROP COLUMN `live_queries`'
    );
  }
}
