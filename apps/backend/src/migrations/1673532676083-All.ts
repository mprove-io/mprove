import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673532676083 implements MigrationInterface {
  name = 'All1673532676083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD PRIMARY KEY (\`struct_id\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`metric_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`metric_id\` varchar(128) NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD PRIMARY KEY (\`struct_id\`, \`metric_id\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD PRIMARY KEY (\`struct_id\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`metric_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`metric_id\` varchar(32) NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`metrics\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD PRIMARY KEY (\`struct_id\`, \`metric_id\`)`
    );
  }
}
