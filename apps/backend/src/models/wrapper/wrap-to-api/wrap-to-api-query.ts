import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiQuery(x: entities.QueryEntity): common.Query {
  return {
    projectId: x.project_id,
    connectionId: x.connection_id,
    queryId: x.query_id,
    sql: x.sql,
    status: x.status,
    lastRunBy: x.last_run_by,
    lastRunTs: Number(x.last_run_ts),
    lastCancelTs: Number(x.last_cancel_ts),
    lastCompleteTs: Number(x.last_complete_ts),
    lastCompleteDuration: Number(x.last_complete_duration),
    lastErrorMessage: x.last_error_message,
    lastErrorTs: Number(x.last_error_ts),
    data: x.data,
    serverTs: Number(x.server_ts)
  };
}
