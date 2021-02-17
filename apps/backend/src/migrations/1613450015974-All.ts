import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613450015974 implements MigrationInterface {
  name = 'All1613450015974';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `structs` ADD `views` json NOT NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `views`');
  }
}
