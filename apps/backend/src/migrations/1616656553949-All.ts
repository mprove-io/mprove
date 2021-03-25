import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1616656553949 implements MigrationInterface {
  name = 'All1616656553949';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `idemps` (`idempotency_key` varchar(255) NOT NULL, `user_id` varchar(255) NOT NULL, `request` mediumtext NOT NULL, `response` mediumtext NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`idempotency_key`, `user_id`)) ENGINE=InnoDB'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `idemps`');
  }
}
