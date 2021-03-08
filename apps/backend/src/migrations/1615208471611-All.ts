import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615208471611 implements MigrationInterface {
  name = 'All1615208471611';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` ADD `roles` json NOT NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `roles`');
  }
}
