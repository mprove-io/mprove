import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663489919330 implements MigrationInterface {
  name = 'All1663489919330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `notes` (`note_id` varchar(255) NOT NULL, `public_key` text NOT NULL, `private_key` text NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`note_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "ALTER TABLE `projects` ADD `default_branch` varchar(255) NOT NULL DEFAULT 'master'"
    );
    await queryRunner.query(
      "ALTER TABLE `projects` ADD `remote_type` varchar(255) NOT NULL DEFAULT 'Managed'"
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `git_url` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `public_key` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `private_key` text NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `private_key`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `public_key`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `git_url`');
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `remote_type`');
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `default_branch`'
    );
    await queryRunner.query('DROP TABLE `notes`');
  }
}
