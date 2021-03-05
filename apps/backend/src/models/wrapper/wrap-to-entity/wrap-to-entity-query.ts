import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityQuery(x: common.Query): entities.QueryEntity {
  return {
    project_id: x.projectId,
    connection_id: x.connectionId,
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
    server_ts: x.serverTs?.toString()
  };
}
