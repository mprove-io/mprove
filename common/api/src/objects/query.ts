import * as apiEnums from '../enums/_index';

export interface Query {
  query_id: string;
  project_id: string;
  struct_id: string;
  pdt_deps: string[];
  pdt_deps_all: string[];
  sql: string[];
  is_pdt: boolean;
  pdt_trigger_time: string;
  pdt_trigger_sql: string;
  pdt_need_start_by_time: boolean;
  pdt_trigger_sql_value: string;
  pdt_trigger_sql_last_error_message: string;
  pdt_id: string;
  status: apiEnums.QueryStatusEnum;
  last_run_by: string;
  last_run_ts: number;
  last_cancel_ts: number;
  last_complete_ts: number;
  last_complete_duration: number;
  last_error_message: string;
  last_error_ts: number;
  data: string;
  temp: boolean;
  server_ts: number;
}
