import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1675086195704 implements MigrationInterface {
  name = 'All1675086195704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` CHANGE \`file_path\` \`file_path\` text NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` CHANGE \`file_path\` \`file_path\` text NOT NULL`
    );
  }
}
