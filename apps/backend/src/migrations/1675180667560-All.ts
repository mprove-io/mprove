import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1675180667560 implements MigrationInterface {
  name = 'All1675180667560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`access_users\` json NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`access_roles\` json NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` DROP COLUMN \`access_roles\``
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` DROP COLUMN \`access_users\``
    );
  }
}
