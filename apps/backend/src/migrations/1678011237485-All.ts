import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1678011237485 implements MigrationInterface {
  name = 'All1678011237485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`time_label\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`time_label\``
    );
  }
}
