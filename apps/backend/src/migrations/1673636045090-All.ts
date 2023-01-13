import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673636045090 implements MigrationInterface {
  name = 'All1673636045090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`fixed_parameters\``
    );
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP COLUMN \`hidden\``);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`partLabel\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`file_path\` text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`part_label\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`params\` json NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP COLUMN \`params\``);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`part_label\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`file_path\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`partLabel\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`hidden\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`fixed_parameters\` json NOT NULL`
    );
  }
}
