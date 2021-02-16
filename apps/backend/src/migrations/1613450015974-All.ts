import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613450015974 implements MigrationInterface {
  name = 'All1613450015974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `structs` ADD `views` json NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `views`');
  }
}
