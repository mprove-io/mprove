import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1664003339398 implements MigrationInterface {
  name = 'All1664003339398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `env_id` varchar(32) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `queries` DROP COLUMN `env_id`');
  }
}
