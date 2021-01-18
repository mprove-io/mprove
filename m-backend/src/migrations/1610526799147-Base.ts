import { MigrationInterface, QueryRunner } from 'typeorm';

export class Base1610526799147 implements MigrationInterface {
  name = 'Base1610526799147';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user` (`user_id` varchar(255) NOT NULL, `email_verified` varchar(255) NOT NULL, `email_verification_token` varchar(255) NOT NULL, `password_reset_token` varchar(255) NULL, `password_reset_expires_ts` bigint NULL, `hash` varchar(255) NULL, `salt` varchar(255) NULL, `user_track_id` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `small_avatar_url` varchar(255) NULL, `big_avatar_url` varchar(255) NULL, `status` varchar(255) NOT NULL, `deleted` varchar(255) NOT NULL, UNIQUE INDEX `IDX_54663aeef9987efe0b4a3bda93` (`email_verification_token`), UNIQUE INDEX `IDX_a53e5d9ab118cc964318b3f729` (`password_reset_token`), UNIQUE INDEX `IDX_6e2b2feb7f98df17f12450441c` (`user_track_id`), UNIQUE INDEX `IDX_1d5324dc4f0c41f17ebe4bf5ab` (`alias`), PRIMARY KEY (`user_id`)) ENGINE=InnoDB'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_1d5324dc4f0c41f17ebe4bf5ab` ON `user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_6e2b2feb7f98df17f12450441c` ON `user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_a53e5d9ab118cc964318b3f729` ON `user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_54663aeef9987efe0b4a3bda93` ON `user`'
    );
    await queryRunner.query('DROP TABLE `user`');
  }
}
