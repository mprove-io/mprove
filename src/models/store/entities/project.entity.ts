// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_project')
export class ProjectEntity implements ProjectInterface {
  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  has_credentials: enums.bEnum;

  @Column({ type: constants.PROJECT_BIGQUERY_PROJECT_DATATYPE, nullable: true })
  bigquery_project: string;

  @Column({
    type: constants.PROJECT_BIGQUERY_CLIENT_EMAIL_DATATYPE,
    nullable: true
  })
  bigquery_client_email: string;

  @Column({
    type: constants.PROJECT_BIGQUERY_CREDENTIALS_DATATYPE,
    nullable: true
  })
  bigquery_credentials: string;

  @Column({
    type: constants.PROJECT_BIGQUERY_CREDENTIALS_FILE_PATH_DATATYPE,
    nullable: true
  })
  bigquery_credentials_file_path: string;

  @Column({ type: constants.PROJECT_QUERY_SIZE_LIMIT_DATATYPE })
  query_size_limit: number;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  week_start: api.ProjectWeekStartEnum;

  @Column({ type: constants.PROJECT_TIMEZONE_DATATYPE })
  timezone: string;

  @Column({
    type: constants.PROJECT_ANALYTICS_PLAN_ID_DATATYPE,
    nullable: true
  })
  analytics_plan_id: string;

  @Column({
    type: constants.PROJECT_ANALYTICS_MAX_PLAN_ID_DATATYPE,
    nullable: true
  })
  analytics_max_plan_id: string;

  @Column({
    type: constants.PROJECT_ANALYTICS_SUBSCRIPTION_ID_DATATYPE,
    nullable: true
  })
  analytics_subscription_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  deleted: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface ProjectInterface {
  project_id: api.Project['project_id'];
  has_credentials: enums.bEnum; // boolean
  bigquery_project: string; // bigquery_project
  bigquery_client_email: string; // client_email
  bigquery_credentials: string; // not api
  query_size_limit: api.Project['query_size_limit'];
  week_start: api.Project['week_start'];
  timezone: api.Project['timezone'];
  analytics_plan_id: string; // number
  analytics_max_plan_id: string; // number
  analytics_subscription_id: string; // number
  deleted: enums.bEnum; // boolean
  server_ts: string; // number
}
