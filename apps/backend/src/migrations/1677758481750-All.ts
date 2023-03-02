import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1677758481750 implements MigrationInterface {
  name = 'All1677758481750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`kit\` (\`struct_id\` varchar(32) NOT NULL, \`rep_id\` varchar(64) NOT NULL, \`kit_id\` varchar(32) NOT NULL, \`data\` json NOT NULL, \`server_ts\` bigint NOT NULL, PRIMARY KEY (\`kit_id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`kit\``);
  }
}
