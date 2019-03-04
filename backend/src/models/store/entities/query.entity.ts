// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_query')
export class QueryEntity implements QueryInterface {
  @PrimaryColumn({ type: constants.QUERY_ID_DATATYPE })
  query_id: string; // globally unique

  @Column({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.QUERY_PDT_DEPS_DATATYPE })
  pdt_deps: string;

  @Column({ type: constants.QUERY_PDT_DEPS_ALL_DATATYPE })
  pdt_deps_all: string;

  @Column({ type: constants.QUERY_SQL_DATATYPE, nullable: true })
  sql: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_pdt: enums.bEnum;

  @Column({ type: constants.PDT_ID_DATATYPE, nullable: true })
  pdt_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  status: api.QueryStatusEnum;

  @Column({ type: constants.QUERY_LAST_RUN_BY_DATATYPE, nullable: true })
  last_run_by: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  last_run_ts: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  last_cancel_ts: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE, nullable: true })
  last_complete_ts: string;

  @Column({
    type: constants.QUERY_LAST_COMPLETE_DURATION_DATATYPE,
    nullable: true
  })
  last_complete_duration: string;

  @Column({ type: constants.QUERY_LAST_ERROR_MESSAGE_DATATYPE, nullable: true })
  last_error_message: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  last_error_ts: string;

  @Column({ type: constants.QUERY_DATA_DATATYPE, nullable: true })
  data: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  temp: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;

  @Column({
    type: constants.QUERY_BIGQUERY_QUERY_JOB_ID_DATATYPE,
    nullable: true
  })
  bigquery_query_job_id: string;

  @Column({
    type: constants.QUERY_BIGQUERY_COPY_JOB_ID_DATATYPE,
    nullable: true
  })
  bigquery_copy_job_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  bigquery_is_copying: enums.bEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_checking: enums.bEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE, nullable: true })
  refresh: enums.bEnum;
}

interface QueryInterface {
  query_id: api.Query['query_id'];
  project_id: api.Query['project_id'];
  struct_id: api.Query['struct_id'];
  is_pdt: any;
  pdt_deps: string;
  pdt_deps_all: string;
  sql: string;
  status: api.Query['status'];
  last_run_by: api.Query['last_run_by'];
  last_run_ts: any;
  last_cancel_ts: any;
  last_complete_ts: any;
  last_complete_duration: any;
  last_error_message: api.Query['last_error_message'];
  last_error_ts: any;
  data: api.Query['data'];
  temp: any;
  server_ts: any;
}
