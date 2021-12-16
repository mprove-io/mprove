import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1639645850004 implements MigrationInterface {
  name = 'All1639645850004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `is_ssl` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `connections` DROP COLUMN `is_ssl`');
  }
}
