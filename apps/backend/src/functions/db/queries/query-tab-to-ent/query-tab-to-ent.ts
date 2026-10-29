import { Result } from '@praha/byethrow';
import type {
  QueryEnt,
  QueryTab
} from '#backend/drizzle/postgres/tables/queries';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import type { TabService } from '#backend/services/tab/tab.service';
import type { QueryTabToEntError } from '#common/types/backend/function-errors/query-tab-to-ent-error';
import type { QueryLt } from '#common/types/shared/st-lt/queries/query-lt';
import type { QuerySt } from '#common/types/shared/st-lt/queries/query-st';

export function queryTabToEnt(item: {
  tab: QueryTab;
  hashSecret?: string;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<QueryEnt, QueryTabToEntError> {
  let { tab } = item;

  let querySt: QuerySt = {
    sql: tab.sql,
    apiMethod: tab.apiMethod,
    apiUrl: tab.apiUrl,
    apiBody: tab.apiBody,
    lastErrorMessage: tab.lastErrorMessage
  };

  let queryLt: QueryLt = {
    data: tab.data
  };

  return Result.pipe(
    Result.succeed({
      ...item,
      st: querySt,
      lt: queryLt
    }),
    Result.bind('apiUrlHash', v =>
      makeHash({
        input: v.tab.apiUrl,
        hashSecret: v.hashSecret
      })
    ),
    Result.map(
      (v): QueryEnt => ({
        projectId: v.tab.projectId,
        envId: v.tab.envId,
        connectionId: v.tab.connectionId,
        connectionType: v.tab.connectionType,
        queryId: v.tab.queryId,
        reportId: v.tab.reportId,
        reportStructId: v.tab.reportStructId,
        status: v.tab.status,
        lastRunBy: v.tab.lastRunBy,
        lastRunTs: v.tab.lastRunTs,
        lastCancelTs: v.tab.lastCancelTs,
        lastCompleteTs: v.tab.lastCompleteTs,
        lastCompleteDuration: v.tab.lastCompleteDuration,
        lastErrorTs: v.tab.lastErrorTs,
        queryJobId: v.tab.queryJobId,
        bigqueryQueryJobId: v.tab.bigqueryQueryJobId,
        bigqueryConsecutiveErrorsGetJob: v.tab.bigqueryConsecutiveErrorsGetJob,
        bigqueryConsecutiveErrorsGetResults:
          v.tab.bigqueryConsecutiveErrorsGetResults,
        apiUrlHash: v.apiUrlHash,
        sessionId: v.tab.sessionId,
        serverTs: v.tab.serverTs,
        ...getEntProps({
          dataSt: v.st,
          dataLt: v.lt,
          isMetadata: false,
          tabService: v.tabService,
          isEncryptDb: v.isEncryptDb,
          isEncryptMetadata: v.isEncryptMetadata
        })
      })
    )
  );
}
