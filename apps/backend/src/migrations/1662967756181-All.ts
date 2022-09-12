import { MigrationInterface, QueryRunner } from 'typeorm';

export class All1662967756181 implements MigrationInterface {
  name = 'All1662967756181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `notes` (`note_id` varchar(255) NOT NULL, `public_key` text NOT NULL, `private_key` text NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`note_id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `notes`');
  }
}
