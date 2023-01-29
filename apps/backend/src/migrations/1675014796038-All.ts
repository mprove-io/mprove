import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1675014796038 implements MigrationInterface {
  name = 'All1675014796038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` CHANGE \`creator_id\` \`creator_id\` varchar(32) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` CHANGE \`creator_id\` \`creator_id\` varchar(32) NOT NULL`
    );
  }
}
