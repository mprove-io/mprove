import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1675007717001 implements MigrationInterface {
  name = 'All1675007717001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`project_id\` varchar(32) NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`reps\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD PRIMARY KEY (\`struct_id\`, \`rep_id\`, \`project_id\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`draft\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD \`creator_id\` varchar(32) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`creator_id\``);
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`draft\``);
    await queryRunner.query(`ALTER TABLE \`reps\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`reps\` ADD PRIMARY KEY (\`struct_id\`, \`rep_id\`)`
    );
    await queryRunner.query(`ALTER TABLE \`reps\` DROP COLUMN \`project_id\``);
  }
}
