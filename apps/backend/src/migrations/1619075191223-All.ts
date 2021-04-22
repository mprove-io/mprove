import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1619075191223 implements MigrationInterface {
  name = 'All1619075191223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `avatar_small`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `avatar_small` mediumtext NULL'
    );
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `avatar_big`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `avatar_big` mediumtext NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `avatar_big`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `avatar_big` mediumblob NULL'
    );
    await queryRunner.query('ALTER TABLE `avatars` DROP COLUMN `avatar_small`');
    await queryRunner.query(
      'ALTER TABLE `avatars` ADD `avatar_small` mediumblob NULL'
    );
  }
}
