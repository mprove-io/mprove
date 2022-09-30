import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1664527176436 implements MigrationInterface {
  name = 'All1664527176436';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `evs` (`project_id` varchar(32) NOT NULL, `env_id` varchar(32) NOT NULL, `ev_id` varchar(32) NOT NULL, `value` varchar(255) NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`, `env_id`, `ev_id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `evs`');
  }
}
