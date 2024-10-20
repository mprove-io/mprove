import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1729424187143 implements MigrationInterface {
  name = 'All1729424187143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`part_node_label\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`part_field_label\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`time_node_label\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` ADD \`time_field_label\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`time_field_label\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`time_node_label\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`part_field_label\``
    );
    await queryRunner.query(
      `ALTER TABLE \`metrics\` DROP COLUMN \`part_node_label\``
    );
  }
}
