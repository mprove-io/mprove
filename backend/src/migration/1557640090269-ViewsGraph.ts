import { MigrationInterface, QueryRunner } from 'typeorm';

export class ViewsGraph1557640090269 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `m_view` (`view_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `is_pdt` varchar(255) NOT NULL, `view_deps` text NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`view_id`, `project_id`, `repo_id`)) ENGINE=InnoDB'
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP TABLE `m_view`');
  }
}
