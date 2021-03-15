import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1615795089088 implements MigrationInterface {
  name = 'All1615795089088';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` ADD `connection_type` varchar(255) NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `queries` DROP COLUMN `connection_type`'
    );
  }
}
