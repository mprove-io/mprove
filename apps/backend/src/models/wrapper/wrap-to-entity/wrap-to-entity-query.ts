import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityQuery(x: common.Query): entities.QueryEntity {
  return {
    project_id: x.projectId,
    env_id: x.envId,
    connection_id: x.connectionId,
    connection_type: x.connectionType,
    query_id: x.queryId,
    sql: x.sql,
    data: x.data,
    status: x.status,
    last_run_by: x.lastRunBy,
    last_run_ts: x.lastRunTs?.toString(),
    last_cancel_ts: x.lastCancelTs?.toString(),
    last_complete_ts: x.lastCompleteTs?.toString(),
    last_complete_duration: x.lastCompleteDuration?.toString(),
    last_error_message: x.lastErrorMessage,
    last_error_ts: x.lastErrorTs?.toString(),
    query_job_id: null,
    bigquery_query_job_id: null,
    bigquery_consecutive_errors_get_job: common.isDefined(
      x.bigqueryConsecutiveErrorsGetJob
    )
      ? x.bigqueryConsecutiveErrorsGetJob
      : 0,
    bigquery_consecutive_errors_get_results: common.isDefined(
      x.bigqueryConsecutiveErrorsGetResults
    )
      ? x.bigqueryConsecutiveErrorsGetResults
      : 0,
    server_ts: x.serverTs?.toString()
  };
}
