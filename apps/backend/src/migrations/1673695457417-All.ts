import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1673695457417 implements MigrationInterface {
  name = 'All1673695457417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`apis\` (\`struct_id\` varchar(32) NOT NULL, \`api_id\` varchar(32) NOT NULL, \`file_path\` text NOT NULL, \`label\` varchar(255) NOT NULL, \`steps\` json NOT NULL, \`server_ts\` bigint NOT NULL, PRIMARY KEY (\`struct_id\`, \`api_id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`metrics\` (\`struct_id\` varchar(32) NOT NULL, \`metric_id\` varchar(128) NOT NULL, \`top_node\` varchar(255) NOT NULL, \`part_id\` varchar(255) NOT NULL, \`file_path\` text NOT NULL, \`type\` varchar(255) NOT NULL, \`label\` varchar(255) NOT NULL, \`top_label\` varchar(255) NOT NULL, \`part_label\` varchar(255) NOT NULL, \`time_spec\` varchar(255) NULL, \`params\` json NOT NULL, \`model_id\` varchar(255) NULL, \`timefield_id\` varchar(255) NULL, \`field_id\` varchar(255) NULL, \`field_class\` varchar(255) NULL, \`api_id\` varchar(255) NULL, \`entries\` json NULL, \`formula\` mediumtext NULL, \`sql\` mediumtext NULL, \`connection_id\` varchar(255) NULL, \`description\` text NULL, \`server_ts\` bigint NOT NULL, PRIMARY KEY (\`struct_id\`, \`metric_id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`reps\` (\`struct_id\` varchar(32) NOT NULL, \`rep_id\` varchar(64) NOT NULL, \`file_path\` text NOT NULL, \`title\` varchar(255) NOT NULL, \`timezone\` varchar(255) NOT NULL, \`time_spec\` varchar(255) NOT NULL, \`time_range\` varchar(255) NOT NULL, \`rows\` json NOT NULL, \`server_ts\` bigint NOT NULL, PRIMARY KEY (\`struct_id\`, \`rep_id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`reps\``);
    await queryRunner.query(`DROP TABLE \`metrics\``);
    await queryRunner.query(`DROP TABLE \`apis\``);
  }
}
