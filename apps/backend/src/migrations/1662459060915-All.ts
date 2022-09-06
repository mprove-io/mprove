import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1662459060915 implements MigrationInterface {
  name = 'All1662459060915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `warehouse` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` DROP COLUMN `warehouse`'
    );
  }
}
