import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613543389137 implements MigrationInterface {
  name = 'All1613543389137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `avatars` (`user_id` varchar(255) NOT NULL, `avatar_small` mediumblob NULL, `avatar_big` mediumblob NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`user_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `members` DROP COLUMN `avatar_url_small`'
    );
    await queryRunner.query(
      'ALTER TABLE `members` DROP COLUMN `avatar_url_big`'
    );
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `avatar_url_small`'
    );
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `avatar_url_big`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `avatar_url_big` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `avatar_url_small` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `members` ADD `avatar_url_big` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `members` ADD `avatar_url_small` varchar(255) NULL'
    );
    await queryRunner.query('DROP TABLE `avatars`');
  }
}
