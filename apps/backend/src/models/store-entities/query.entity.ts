import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('queries')
export class QueryEntity {
  @Column({ type: constants.PROJECT_ID_VARCHAR, length: 32 })
  project_id: string; // for connection

  @Column({ type: constants.CONNECTION_ID_VARCHAR, length: 32 })
  connection_id: string; // name

  @Column({ type: constants.VARCHAR })
  connection_type: common.ConnectionTypeEnum;

  @PrimaryColumn({ type: constants.QUERY_ID_VARCHAR, length: 64 })
  query_id: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  sql: string;

  @Column({ type: constants.VARCHAR })
  status: common.QueryStatusEnum;

  @Column({ type: constants.JSON, nullable: true })
  data: any;

  @Column({ type: constants.VARCHAR, nullable: true })
  last_run_by: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_run_ts: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_cancel_ts: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_complete_ts: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_complete_duration: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  last_error_message: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_error_ts: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  query_job_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_query_job_id: string;

  @Column({ type: constants.INT })
  bigquery_consecutive_errors_get_job: number;

  @Column({ type: constants.INT })
  bigquery_consecutive_errors_get_results: number;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
