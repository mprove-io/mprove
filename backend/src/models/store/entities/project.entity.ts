// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_project')
export class ProjectEntity {
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

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  deleted: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}
