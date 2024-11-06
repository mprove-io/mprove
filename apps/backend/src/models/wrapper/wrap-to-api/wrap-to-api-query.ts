import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToApiQuery(x: schemaPostgres.QueryEnt): common.Query {
  return {
    projectId: x.projectId,
    envId: x.envId,
    connectionId: x.connectionId,
    connectionType: x.connectionType,
    queryId: x.queryId,
    sql: x.sql,
    status: x.status,
    lastRunBy: x.lastRunBy,
    lastRunTs: x.lastRunTs,
    lastCancelTs: x.lastCancelTs,
    lastCompleteTs: x.lastCompleteTs,
    lastCompleteDuration: x.lastCompleteDuration,
    lastErrorMessage: x.lastErrorMessage,
    lastErrorTs: x.lastErrorTs,
    data: x.data,
    queryJobId: x.queryJobId,
    bigqueryQueryJobId: x.bigqueryQueryJobId,
    bigqueryConsecutiveErrorsGetJob: x.bigqueryConsecutiveErrorsGetJob,
    bigqueryConsecutiveErrorsGetResults: x.bigqueryConsecutiveErrorsGetResults,
    serverTs: x.serverTs
  };
}
