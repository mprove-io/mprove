import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityQuery(item: {
  query: common.Query;
}): schemaPostgres.QueryEnt {
  let { query } = item;

  return {
    projectId: query.projectId,
    envId: query.envId,
    connectionId: query.connectionId,
    connectionType: query.connectionType,
    queryId: query.queryId,
    sql: query.sql,
    data: query.data,
    status: query.status,
    lastRunBy: query.lastRunBy,
    lastRunTs: query.lastRunTs,
    lastCancelTs: query.lastCancelTs,
    lastCompleteTs: query.lastCompleteTs,
    lastCompleteDuration: query.lastCompleteDuration,
    lastErrorMessage: query.lastErrorMessage,
    lastErrorTs: query.lastErrorTs,
    queryJobId: undefined, // null
    bigqueryQueryJobId: undefined, // null
    bigqueryConsecutiveErrorsGetJob: common.isDefined(
      query.bigqueryConsecutiveErrorsGetJob
    )
      ? query.bigqueryConsecutiveErrorsGetJob
      : 0,
    bigqueryConsecutiveErrorsGetResults: common.isDefined(
      query.bigqueryConsecutiveErrorsGetResults
    )
      ? query.bigqueryConsecutiveErrorsGetResults
      : 0,
    serverTs: query.serverTs
  };
}
