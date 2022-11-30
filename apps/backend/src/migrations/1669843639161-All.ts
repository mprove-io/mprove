import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1669843639161 implements MigrationInterface {
  name = 'All1669843639161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`jwt_min_iat\` bigint NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`jwt_min_iat\``
    );
  }
}
