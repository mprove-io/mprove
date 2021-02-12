import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613112415623 implements MigrationInterface {
  name = 'All1613112415623';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_1977502cf06b3005768826e1e3` ON `members`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_2714af51e3f7dd42cf66eeb08d` ON `members`'
    );
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `owner_id` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `orgs` ADD `owner_email` varchar(255) NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `owner_email`');
    await queryRunner.query('ALTER TABLE `orgs` DROP COLUMN `owner_id`');
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_2714af51e3f7dd42cf66eeb08d` ON `members` (`email`)'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_1977502cf06b3005768826e1e3` ON `members` (`alias`)'
    );
  }
}
