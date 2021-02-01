import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1611300729118 implements MigrationInterface {
  name = 'User1611300729118';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `big_avatar_url`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `deleted`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `email_verified`');
    await queryRunner.query(
      'ALTER TABLE `user` DROP COLUMN `small_avatar_url`'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `is_email_verified` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `avatar_url_small` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `avatar_url_big` varchar(255) NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `avatar_url_big`');
    await queryRunner.query(
      'ALTER TABLE `user` DROP COLUMN `avatar_url_small`'
    );
    await queryRunner.query(
      'ALTER TABLE `user` DROP COLUMN `is_email_verified`'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `small_avatar_url` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `email_verified` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `deleted` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `big_avatar_url` varchar(255) NULL'
    );
  }
}
