import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1677228507629 implements MigrationInterface {
  name = 'All1677228507629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`ui\` json NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`ui\``);
  }
}
