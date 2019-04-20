import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityQuery(query: api.Query): entities.QueryEntity {
  return {
    query_id: helper.undefinedToNull(query.query_id),
    project_id: helper.undefinedToNull(query.project_id),
    struct_id: helper.undefinedToNull(query.struct_id),
    pdt_deps: query.pdt_deps
      ? JSON.stringify(query.pdt_deps)
      : JSON.stringify([]),
    pdt_deps_all: query.pdt_deps_all
      ? JSON.stringify(query.pdt_deps_all)
      : JSON.stringify([]),
    sql: query.sql ? JSON.stringify(query.sql) : null,
    is_pdt: helper.booleanToBenum(query.is_pdt),
    pdt_id: helper.undefinedToNull(query.pdt_id),
    status: helper.undefinedToNull(query.status),
    last_run_by: helper.undefinedToNull(query.last_run_by),
    last_run_ts: query.last_run_ts ? query.last_run_ts.toString() : null,
    last_cancel_ts: query.last_cancel_ts
      ? query.last_cancel_ts.toString()
      : null,
    last_complete_ts: query.last_complete_ts
      ? query.last_complete_ts.toString()
      : null,
    last_complete_duration: query.last_complete_duration
      ? query.last_complete_duration.toString()
      : null,
    last_error_message: helper.undefinedToNull(query.last_error_message),
    last_error_ts: query.last_error_ts ? query.last_error_ts.toString() : null,
    data: helper.undefinedToNull(query.data),
    temp: helper.booleanToBenum(query.temp),
    server_ts: query.server_ts ? query.server_ts.toString() : null,
    bigquery_query_job_id: null,
    bigquery_copy_job_id: null,
    bigquery_is_copying: helper.booleanToBenum(false),
    refresh: null
  };
}
