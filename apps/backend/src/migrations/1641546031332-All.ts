import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1641546031332 implements MigrationInterface {
  name = 'All1641546031332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `listen` json NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `listen`');
  }
}
