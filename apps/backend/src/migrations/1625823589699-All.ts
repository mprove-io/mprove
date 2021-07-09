import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1625823589699 implements MigrationInterface {
  name = 'All1625823589699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mconfigs` CHANGE `charts` `chart` json NOT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mconfigs` CHANGE `chart` `charts` json NOT NULL'
    );
  }
}
