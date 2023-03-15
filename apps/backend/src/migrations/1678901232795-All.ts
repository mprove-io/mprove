import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1678901232795 implements MigrationInterface {
  name = 'All1678901232795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP COLUMN \`entries\``);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`time_spec\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`time_spec\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`entries\` json NULL`
    );
  }
}
