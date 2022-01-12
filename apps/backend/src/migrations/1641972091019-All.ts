import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1641972091019 implements MigrationInterface {
  name = 'All1641972091019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `models` ADD `connection_id` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `models` DROP COLUMN `connection_id`');
  }
}
