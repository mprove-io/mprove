import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1613028591562 implements MigrationInterface {
  name = 'All1613028591562';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `sorts`');
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `sorts` text NOT NULL');
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `errors`');
    await queryRunner.query('ALTER TABLE `structs` ADD `errors` json NOT NULL');
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `udfs_dict`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `udfs_dict` json NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `views` DROP COLUMN `view_deps`');
    await queryRunner.query(
      'ALTER TABLE `views` ADD `view_deps` json NOT NULL'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `views` DROP COLUMN `view_deps`');
    await queryRunner.query(
      'ALTER TABLE `views` ADD `view_deps` text NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `udfs_dict`');
    await queryRunner.query(
      'ALTER TABLE `structs` ADD `udfs_dict` text NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `structs` DROP COLUMN `errors`');
    await queryRunner.query('ALTER TABLE `structs` ADD `errors` text NOT NULL');
    await queryRunner.query('ALTER TABLE `mconfigs` DROP COLUMN `sorts`');
    await queryRunner.query('ALTER TABLE `mconfigs` ADD `sorts` json NOT NULL');
  }
}
