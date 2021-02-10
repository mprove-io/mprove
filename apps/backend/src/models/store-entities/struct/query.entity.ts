import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('queries')
export class QueryEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // for connection

  @Column({ type: constants.CONNECTION_ID_VARCHAR })
  connection_id: string; // name

  @PrimaryColumn({ type: constants.QUERY_ID_VARCHAR })
  query_id: string;

  // @Column({ type: constants.QUERY_PDT_DEPS_DATATYPE })
  // pdt_deps: string;

  // @Column({ type: constants.QUERY_PDT_DEPS_ALL_DATATYPE })
  // pdt_deps_all: string;

  // @Column({ type: constants.QUERY_SQL_DATATYPE, nullable: true })
  // sql: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // is_pdt: enums.bEnum;

  // @Column({ type: constants.PDT_ID_DATATYPE, nullable: true })
  // pdt_id: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // status: api.QueryStatusEnum;

  // @Column({ type: constants.QUERY_LAST_RUN_BY_DATATYPE, nullable: true })
  // last_run_by: string;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  // last_run_ts: string;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  // last_cancel_ts: string;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE, nullable: true })
  // last_complete_ts: string;

  // @Column({
  //   type: constants.QUERY_LAST_COMPLETE_DURATION_DATATYPE,
  //   nullable: true
  // })
  // last_complete_duration: string;

  // @Column({ type: constants.QUERY_LAST_ERROR_MESSAGE_DATATYPE, nullable: true })
  // last_error_message: string;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  // last_error_ts: string;

  // @Column({ type: constants.QUERY_DATA_DATATYPE, nullable: true })
  // data: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // temp: enums.bEnum;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  // server_ts: string;

  // @Column({
  //   type: constants.QUERY_POSTGRES_QUERY_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // postgres_query_job_id: string;

  // @Column({
  //   type: constants.QUERY_BIGQUERY_QUERY_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // bigquery_query_job_id: string;

  // @Column({
  //   type: constants.QUERY_BIGQUERY_COPY_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // bigquery_copy_job_id: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // bigquery_is_copying: enums.bEnum;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE, nullable: true })
  // refresh: enums.bEnum;

  // // trigger time

  // @Column({ type: constants.QUERY_PDT_TRIGGER_TIME_DATATYPE, nullable: true })
  // pdt_trigger_time: string;

  // @Column({
  //   type: constants.QUERY_PDT_TRIGGER_TIME_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // pdt_trigger_time_job_id: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE, nullable: true })
  // pdt_need_start_by_time: enums.bEnum;

  // // trigger sql

  // @Column({ type: constants.QUERY_PDT_TRIGGER_SQL_DATATYPE, nullable: true })
  // pdt_trigger_sql: string;

  // @Column({
  //   type: constants.QUERY_PDT_TRIGGER_SQL_VALUE_DATATYPE,
  //   nullable: true
  // })
  // pdt_trigger_sql_value: string;

  // @Column({
  //   type: constants.QUERY_PDT_TRIGGER_SQL_BIGQUERY_QUERY_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // pdt_trigger_sql_bigquery_query_job_id: string;

  // @Column({
  //   type: constants.QUERY_PDT_TRIGGER_SQL_POSTGRES_QUERY_JOB_ID_DATATYPE,
  //   nullable: true
  // })
  // pdt_trigger_sql_postgres_query_job_id: string;

  // @Column({
  //   type: constants.QUERY_PDT_TRIGGER_SQL_LAST_ERROR_MESSAGE_DATATYPE,
  //   nullable: true
  // })
  // pdt_trigger_sql_last_error_message: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE, nullable: true })
  // pdt_need_start_by_trigger_sql: enums.bEnum;

  // //

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
