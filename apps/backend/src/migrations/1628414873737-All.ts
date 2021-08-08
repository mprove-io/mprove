import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1628414873737 implements MigrationInterface {
  name = 'All1628414873737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `model_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `vizs` ADD `model_label` varchar(255) NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `model_label`');
    await queryRunner.query('ALTER TABLE `vizs` DROP COLUMN `model_id`');
  }
}
