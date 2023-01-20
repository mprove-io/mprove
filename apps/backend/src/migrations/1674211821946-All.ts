import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1674211821946 implements MigrationInterface {
  name = 'All1674211821946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`time_range\``);
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`time_spec\``);
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`timezone\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`timezone\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`time_spec\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`time_range\` varchar(255) NOT NULL`
    );
  }
}
