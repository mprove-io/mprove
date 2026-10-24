import type { QueryTab } from '#backend/drizzle/postgres/schema/_tabs';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Query } from '#common/types/blockml/parts/query/query';

export function queryApiToTab(item: { apiQuery: Query }): QueryTab {
  let { apiQuery } = item;

  if (isUndefined(apiQuery)) {
    return;
  }

  let query: QueryTab = {
    projectId: apiQuery.projectId,
    envId: apiQuery.envId,
    connectionId: apiQuery.connectionId,
    connectionType: apiQuery.connectionType,
    queryId: apiQuery.queryId,
    reportId: apiQuery.reportId,
    reportStructId: apiQuery.reportStructId,
    status: apiQuery.status,
    lastRunBy: apiQuery.lastRunBy,
    lastRunTs: apiQuery.lastRunTs,
    lastCancelTs: apiQuery.lastCancelTs,
    lastCompleteTs: apiQuery.lastCompleteTs,
    lastCompleteDuration: apiQuery.lastCompleteDuration,
    lastErrorTs: apiQuery.lastErrorTs,
    queryJobId: undefined,
    bigqueryQueryJobId: undefined,
    bigqueryConsecutiveErrorsGetJob: isDefined(
      apiQuery.bigqueryConsecutiveErrorsGetJob
    )
      ? apiQuery.bigqueryConsecutiveErrorsGetJob
      : 0,
    bigqueryConsecutiveErrorsGetResults: isDefined(
      apiQuery.bigqueryConsecutiveErrorsGetResults
    )
      ? apiQuery.bigqueryConsecutiveErrorsGetResults
      : 0,
    sql: apiQuery.sql,
    apiMethod: apiQuery.apiMethod,
    apiUrl: apiQuery.apiUrl,
    apiBody: apiQuery.apiBody,
    lastErrorMessage: apiQuery.lastErrorMessage,
    data: apiQuery.data,
    apiUrlHash: undefined, // tab-to-ent
    sessionId: undefined,
    keyTag: undefined,
    serverTs: apiQuery.serverTs
  };

  return query;
}
