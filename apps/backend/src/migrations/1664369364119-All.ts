import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1664369364119 implements MigrationInterface {
  name = 'All1664369364119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` ADD `envs` json NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `envs`');
  }
}
