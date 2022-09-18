import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1663488885941 implements MigrationInterface {
  name = 'All1663488885941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `projects` CHANGE `default_branch` `default_branch` varchar(255) NOT NULL DEFAULT 'master'"
    );
    await queryRunner.query(
      "ALTER TABLE `projects` CHANGE `remote_type` `remote_type` varchar(255) NOT NULL DEFAULT 'Managed'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` CHANGE `remote_type` `remote_type` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `projects` CHANGE `default_branch` `default_branch` varchar(255) NOT NULL'
    );
  }
}
