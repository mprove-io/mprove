import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673527752580 implements MigrationInterface {
  name = 'All1673527752580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`metrics\` (\`struct_id\` varchar(32) NOT NULL, \`metric_id\` varchar(32) NOT NULL, \`top_node\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`fixed_parameters\` json NOT NULL, \`model_id\` varchar(255) NULL, \`field_id\` varchar(255) NULL, \`timefield_id\` varchar(255) NULL, \`api_id\` varchar(255) NULL, \`timespec\` varchar(255) NULL, \`entries\` json NULL, \`formula\` mediumtext NULL, \`sql\` mediumtext NULL, \`connection_id\` varchar(255) NULL, \`label\` varchar(255) NOT NULL, \`hidden\` varchar(255) NOT NULL, \`description\` text NULL, \`server_ts\` bigint NOT NULL, PRIMARY KEY (\`struct_id\`, \`metric_id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`metrics\``);
  }
}
