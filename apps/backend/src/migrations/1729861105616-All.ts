import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1729861105616 implements MigrationInterface {
  name = 'All1729861105616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`dashboards\` CHANGE \`reports\` \`tiles\` json NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`vizs\` CHANGE \`reports\` \`tiles\` json NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vizs\` CHANGE \`tiles\` \`reports\` json NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`dashboards\` CHANGE \`tiles\` \`reports\` json NOT NULL`
    );
  }
}
