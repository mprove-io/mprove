import { MigrationInterface, QueryRunner } from 'typeorm';

export class Member1612767059767 implements MigrationInterface {
  name = 'Member1612767059767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `member` (`member_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `avatar_url_small` varchar(255) NULL, `avatar_url_big` varchar(255) NULL, `timezone` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `is_editor` varchar(255) NOT NULL, `is_admin` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_5c782be2ad6bfa17b18057a827` (`alias`), PRIMARY KEY (`member_id`, `project_id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_5c782be2ad6bfa17b18057a827` ON `member`'
    );
    await queryRunner.query('DROP TABLE `member`');
  }
}
