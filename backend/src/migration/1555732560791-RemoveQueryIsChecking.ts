import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveQueryIsChecking1555732560791 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE `m_query` DROP COLUMN `is_checking`');
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `m_query` ADD `is_checking` varchar(255) NOT NULL'
    );
  }
}
