import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1628243051575 implements MigrationInterface {
  name = 'All1628243051575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `title` varchar(255) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `title`');
  }
}
