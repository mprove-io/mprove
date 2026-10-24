import type { QueryTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';

export function queryTabToApi(item: { query: QueryTab }): Query {
  let { query } = item;

  let apiQuery: Query = {
    projectId: query.projectId,
    envId: query.envId,
    connectionId: query.connectionId,
    connectionType: query.connectionType,
    queryId: query.queryId,
    reportId: query.reportId,
    reportStructId: query.reportStructId,
    sql: query.sql,
    apiMethod: query.apiMethod as StoreMethod,
    apiUrl: query.apiUrl,
    apiBody: query.apiBody,
    status: query.status,
    lastRunBy: query.lastRunBy,
    lastRunTs: query.lastRunTs,
    lastCancelTs: query.lastCancelTs,
    lastCompleteTs: query.lastCompleteTs,
    lastCompleteDuration: query.lastCompleteDuration,
    lastErrorMessage: query.lastErrorMessage,
    lastErrorTs: query.lastErrorTs,
    data: query.data,
    queryJobId: query.queryJobId,
    bigqueryQueryJobId: query.bigqueryQueryJobId,
    bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
    bigqueryConsecutiveErrorsGetResults:
      query.bigqueryConsecutiveErrorsGetResults,
    serverTs: query.serverTs
  };

  return apiQuery;
}
