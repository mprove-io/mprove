import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673555637476 implements MigrationInterface {
  name = 'All1673555637476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`part_id\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`field_class\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`partLabel\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`partLabel\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`field_class\``
    );
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP COLUMN \`part_id\``);
  }
}
