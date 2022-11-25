import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1669375708480 implements MigrationInterface {
  name = 'All1669375708480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orgs\` DROP COLUMN \`company_size\``
    );
    await queryRunner.query(
      `ALTER TABLE \`orgs\` DROP COLUMN \`contact_phone\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orgs\` ADD \`contact_phone\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`orgs\` ADD \`company_size\` varchar(255) NULL`
    );
  }
}
