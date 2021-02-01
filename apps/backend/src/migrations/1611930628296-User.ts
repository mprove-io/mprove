import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1611930628296 implements MigrationInterface {
  name = 'User1611930628296';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_6e2b2feb7f98df17f12450441c` ON `user`'
    );
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `user_track_id`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `email` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)'
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `timezone` varchar(255) NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `timezone`');
    await queryRunner.query(
      'ALTER TABLE `user` DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2`'
    );
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `email`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `user_track_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_6e2b2feb7f98df17f12450441c` ON `user` (`user_track_id`)'
    );
  }
}
