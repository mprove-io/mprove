import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1662289276856 implements MigrationInterface {
  name = 'All1662289276856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `postgres_database` TO `database`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `postgres_host` TO `host`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `postgres_port` TO `port`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `postgres_user` TO `username`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `postgres_password` TO `password`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` ADD `account` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `database` TO `postgres_database`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `host` TO `postgres_host`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `port` TO `postgres_port`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `username` TO `postgres_user`'
    );
    await queryRunner.query(
      'ALTER TABLE `connections` RENAME COLUMN `password` TO `postgres_password`'
    );
    await queryRunner.query('ALTER TABLE `connections` DROP COLUMN `account`');
  }
}
