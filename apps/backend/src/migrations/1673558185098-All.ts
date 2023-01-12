import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673558185098 implements MigrationInterface {
  name = 'All1673558185098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`top_label\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`top_label\``
    );
  }
}
