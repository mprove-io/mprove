import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1619593505396 implements MigrationInterface {
  name = 'All1619593505396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `members` DROP COLUMN `status`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `status`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `status` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `members` ADD `status` varchar(255) NOT NULL'
    );
  }
}
