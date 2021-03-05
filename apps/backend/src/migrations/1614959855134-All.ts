import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1614959855134 implements MigrationInterface {
  name = 'All1614959855134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mconfigs` CHANGE `sorts` `sorts` text NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mconfigs` CHANGE `sorts` `sorts` text NOT NULL'
    );
  }
}
