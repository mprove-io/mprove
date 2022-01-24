import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1643013591077 implements MigrationInterface {
  name = 'All1643013591077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mconfigs` ADD `model_label` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `model_label`');
  }
}
