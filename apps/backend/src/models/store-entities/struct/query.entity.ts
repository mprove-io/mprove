import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('queries')
export class QueryEntity {
  @Column({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // for connection

  @Column({ type: constants.CONNECTION_ID_VARCHAR })
  connection_id: string; // name

  @PrimaryColumn({ type: constants.QUERY_ID_VARCHAR })
  query_id: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  sql: string;

  @Column({ type: constants.JSON, nullable: true })
  data: any;

  @Column({ type: constants.VARCHAR })
  status: common.QueryStatusEnum;

  @Column({ type: constants.VARCHAR, nullable: true })
  last_run_by: string;

  @Column({ type: constants.BIGINT })
  last_run_ts: string;

  @Column({ type: constants.BIGINT })
  last_cancel_ts: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_complete_ts: string;

  @Column({ type: constants.BIGINT, nullable: true })
  last_complete_duration: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  last_error_message: string;

  @Column({ type: constants.BIGINT })
  last_error_ts: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  postgres_query_job_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_query_job_id: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
