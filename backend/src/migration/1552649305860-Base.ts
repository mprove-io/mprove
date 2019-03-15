import { MigrationInterface, QueryRunner } from 'typeorm';

export class Base1552649305860 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `m_chunk_session` (`chunk_id` varchar(255) NOT NULL, `session_id` varchar(255) NOT NULL, PRIMARY KEY (`chunk_id`, `session_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_chunk` (`chunk_id` varchar(255) NOT NULL, `content` mediumtext NOT NULL, `source_session_id` varchar(255) NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`chunk_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_dashboard` (`dashboard_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `content` mediumtext NOT NULL, `access_users` text NOT NULL, `title` varchar(255) NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `fields` mediumtext NOT NULL, `reports` text NOT NULL, `temp` varchar(255) NOT NULL, `description` text NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`dashboard_id`, `project_id`, `repo_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_error` (`error_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `message` text NOT NULL, `lines` text NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`error_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_file` (`file_absolute_id` varchar(255) NOT NULL, `file_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `path` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `content` mediumtext NOT NULL, `deleted` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`file_absolute_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_mconfig` (`mconfig_id` varchar(255) NOT NULL, `query_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `model_id` varchar(255) NOT NULL, `select` text NOT NULL, `sortings` text NOT NULL, `sorts` text NULL, `timezone` varchar(255) NOT NULL, `limit` int NOT NULL, `filters` text NOT NULL, `charts` text NOT NULL, `temp` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`mconfig_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_member` (`member_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `picture_url_small` varchar(255) NULL, `picture_url_big` varchar(255) NULL, `status` varchar(255) NOT NULL, `is_editor` varchar(255) NOT NULL, `is_admin` varchar(255) NOT NULL, `deleted` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`member_id`, `project_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_message` (`message_id` varchar(255) NOT NULL, `content` mediumtext NOT NULL, `session_id` varchar(255) NOT NULL, `chunk_id` varchar(255) NOT NULL, `is_confirmed` varchar(255) NOT NULL, `is_sent` varchar(255) NOT NULL, `last_send_attempt_ts` bigint NOT NULL, `chunk_server_ts` bigint NOT NULL, PRIMARY KEY (`message_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_model` (`model_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `repo_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `content` mediumtext NOT NULL, `access_users` text NOT NULL, `label` varchar(255) NOT NULL, `gr` varchar(255) NULL, `hidden` varchar(255) NOT NULL, `fields` text NOT NULL, `nodes` text NOT NULL, `description` text NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`model_id`, `project_id`, `repo_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_project` (`project_id` varchar(255) NOT NULL, `has_credentials` varchar(255) NOT NULL, `bigquery_project` varchar(255) NULL, `bigquery_client_email` varchar(255) NULL, `bigquery_credentials` text NULL, `bigquery_credentials_file_path` varchar(255) NULL, `query_size_limit` int NOT NULL, `week_start` varchar(255) NOT NULL, `timezone` varchar(255) NOT NULL, `deleted` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`project_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_query` (`query_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `pdt_deps` text NOT NULL, `pdt_deps_all` text NOT NULL, `sql` mediumtext NULL, `is_pdt` varchar(255) NOT NULL, `pdt_id` varchar(255) NULL, `status` varchar(255) NOT NULL, `last_run_by` varchar(255) NULL, `last_run_ts` bigint NOT NULL, `last_cancel_ts` bigint NOT NULL, `last_complete_ts` bigint NULL, `last_complete_duration` bigint NULL, `last_error_message` mediumtext NULL, `last_error_ts` bigint NOT NULL, `data` mediumtext NULL, `temp` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, `bigquery_query_job_id` varchar(255) NULL, `bigquery_copy_job_id` varchar(255) NULL, `bigquery_is_copying` varchar(255) NOT NULL, `is_checking` varchar(255) NOT NULL, `refresh` varchar(255) NULL, PRIMARY KEY (`query_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_repo` (`repo_id` varchar(255) NOT NULL, `project_id` varchar(255) NOT NULL, `struct_id` varchar(255) NOT NULL, `udfs_content` text NOT NULL, `pdts_sorted` text NOT NULL, `nodes` mediumtext NOT NULL, `status` varchar(255) NOT NULL, `conflicts` text NOT NULL, `remote_url` varchar(255) NULL, `remote_webhook` varchar(255) NULL, `remote_public_key` varchar(255) NULL, `remote_last_push_ts` bigint NOT NULL, `remote_push_access_is_ok` varchar(255) NOT NULL, `remote_push_error_message` text NULL, `remote_need_manual_pull` varchar(255) NOT NULL, `remote_last_pull_ts` bigint NOT NULL, `remote_pull_access_is_ok` varchar(255) NOT NULL, `remote_pull_error_message` text NULL, `server_ts` bigint NOT NULL, PRIMARY KEY (`repo_id`, `project_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_session` (`session_id` varchar(255) NOT NULL, `user_id` varchar(255) NOT NULL, `is_activated` varchar(255) NOT NULL, `last_pong_ts` bigint NULL, PRIMARY KEY (`session_id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `m_user` (`user_id` varchar(255) NOT NULL, `email_verified` varchar(255) NOT NULL, `email_verification_token` varchar(255) NOT NULL, `password_reset_token` varchar(255) NULL, `password_reset_expires_ts` bigint NULL, `hash` varchar(255) NULL, `salt` varchar(255) NULL, `user_track_id` varchar(255) NOT NULL, `alias` varchar(255) NULL, `first_name` varchar(255) NULL, `last_name` varchar(255) NULL, `picture_url_small` varchar(255) NULL, `picture_url_big` varchar(255) NULL, `timezone` varchar(255) NULL, `status` varchar(255) NOT NULL, `main_theme` varchar(255) NOT NULL, `dash_theme` varchar(255) NOT NULL, `file_theme` varchar(255) NOT NULL, `sql_theme` varchar(255) NOT NULL, `deleted` varchar(255) NOT NULL, `server_ts` bigint NOT NULL, UNIQUE INDEX `IDX_a8b1dab457f82233b0a93b2080` (`email_verification_token`), UNIQUE INDEX `IDX_17bd6311e58b0285ad8e0ec69d` (`password_reset_token`), UNIQUE INDEX `IDX_b7dff9325d93598cac0ce55729` (`user_track_id`), UNIQUE INDEX `IDX_178372fdb90cfcf55efd64d15a` (`alias`), PRIMARY KEY (`user_id`)) ENGINE=InnoDB'
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'DROP INDEX `IDX_178372fdb90cfcf55efd64d15a` ON `m_user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_b7dff9325d93598cac0ce55729` ON `m_user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_17bd6311e58b0285ad8e0ec69d` ON `m_user`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_a8b1dab457f82233b0a93b2080` ON `m_user`'
    );
    await queryRunner.query('DROP TABLE `m_user`');
    await queryRunner.query('DROP TABLE `m_session`');
    await queryRunner.query('DROP TABLE `m_repo`');
    await queryRunner.query('DROP TABLE `m_query`');
    await queryRunner.query('DROP TABLE `m_project`');
    await queryRunner.query('DROP TABLE `m_model`');
    await queryRunner.query('DROP TABLE `m_message`');
    await queryRunner.query('DROP TABLE `m_member`');
    await queryRunner.query('DROP TABLE `m_mconfig`');
    await queryRunner.query('DROP TABLE `m_file`');
    await queryRunner.query('DROP TABLE `m_error`');
    await queryRunner.query('DROP TABLE `m_dashboard`');
    await queryRunner.query('DROP TABLE `m_chunk`');
    await queryRunner.query('DROP TABLE `m_chunk_session`');
  }
}
