import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663419638196 implements MigrationInterface {
  name = 'All1663419638196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `default_branch` varchar(255) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `default_branch`'
    );
  }
}
