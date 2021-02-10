import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('projects')
export class ProjectEntity {
  @Column({ type: constants.ORGANIZATION_ID_VARCHAR })
  organization_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @Column({ type: constants.VARCHAR })
  name: string;

  // @Column({
  //   type: constants.ENUM_TO_VARCHAR_DATATYPE,
  //   default: api.ProjectConnectionEnum.BigQuery
  // })
  // connection: api.ProjectConnectionEnum;

  // @Column({
  //   type: constants.PROJECT_POSTGRES_HOST_DATATYPE,
  //   nullable: true
  // })
  // postgres_host: string;

  // @Column({
  //   type: constants.PROJECT_POSTGRES_PORT_DATATYPE,
  //   nullable: true
  // })
  // postgres_port: number;

  // @Column({
  //   type: constants.PROJECT_POSTGRES_DATABASE_DATATYPE,
  //   nullable: true
  // })
  // postgres_database: string;

  // @Column({
  //   type: constants.PROJECT_POSTGRES_USER_DATATYPE,
  //   nullable: true
  // })
  // postgres_user: string;

  // @Column({
  //   type: constants.PROJECT_POSTGRES_PASSWORD_DATATYPE,
  //   nullable: true
  // })
  // postgres_password: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // has_credentials: enums.bEnum;

  // @Column({ type: constants.PROJECT_BIGQUERY_PROJECT_DATATYPE, nullable: true })
  // bigquery_project: string;

  // @Column({
  //   type: constants.PROJECT_BIGQUERY_CLIENT_EMAIL_DATATYPE,
  //   nullable: true
  // })
  // bigquery_client_email: string;

  // @Column({
  //   type: constants.PROJECT_BIGQUERY_CREDENTIALS_DATATYPE,
  //   nullable: true
  // })
  // bigquery_credentials: string;

  // @Column({
  //   type: constants.PROJECT_BIGQUERY_CREDENTIALS_FILE_PATH_DATATYPE,
  //   nullable: true
  // })
  // bigquery_credentials_file_path: string;

  // @Column({ type: constants.PROJECT_QUERY_SIZE_LIMIT_DATATYPE })
  // query_size_limit: number;

  @Column({ type: constants.VARCHAR })
  week_start: common.ProjectWeekStartEnum;

  @Column({ type: constants.VARCHAR })
  timezone: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
