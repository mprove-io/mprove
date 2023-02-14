import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1676378248504 implements MigrationInterface {
  name = 'All1676378248504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`format_number\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`currency_prefix\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`currency_suffix\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`currency_suffix\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`currency_prefix\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`format_number\``
    );
  }
}
