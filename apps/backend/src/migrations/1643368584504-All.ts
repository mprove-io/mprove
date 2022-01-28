import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1643368584504 implements MigrationInterface {
  name = 'All1643368584504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `listen`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `listen` json NULL');
  }
}
