import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { QueryTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type QueryEnt,
  queriesTable
} from '#backend/drizzle/postgres/schema/queries';
import type { DbService } from '#backend/services/db/db.service';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';

export async function getQueriesCheckExistSkipSqlData(item: {
  queryIds: string[];
  projectId: string;
  db: DbService;
}): Result.ResultAsync<QueryTab[], GetQueriesCheckExistSkipSqlDataError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('queries', v =>
      v.db.drizzle
        .select({
          keyTag: queriesTable.keyTag,
          projectId: queriesTable.projectId,
          envId: queriesTable.envId,
          connectionId: queriesTable.connectionId,
          connectionType: queriesTable.connectionType,
          queryId: queriesTable.queryId,
          reportId: queriesTable.reportId,
          reportStructId: queriesTable.reportStructId,
          status: queriesTable.status,
          lastRunBy: queriesTable.lastRunBy,
          lastRunTs: queriesTable.lastRunTs,
          lastCancelTs: queriesTable.lastCancelTs,
          lastCompleteTs: queriesTable.lastCompleteTs,
          lastCompleteDuration: queriesTable.lastCompleteDuration,
          lastErrorTs: queriesTable.lastErrorTs,
          queryJobId: queriesTable.queryJobId,
          bigqueryQueryJobId: queriesTable.bigqueryQueryJobId,
          bigqueryConsecutiveErrorsGetJob:
            queriesTable.bigqueryConsecutiveErrorsGetJob,
          bigqueryConsecutiveErrorsGetResults:
            queriesTable.bigqueryConsecutiveErrorsGetResults,
          st: queriesTable.st,
          // lt: {},
          serverTs: queriesTable.serverTs
        })
        .from(queriesTable)
        .where(
          and(
            inArray(queriesTable.queryId, v.queryIds),
            eq(queriesTable.projectId, v.projectId)
          )
        )
        .then(xs =>
          Result.sequence(xs, x =>
            v.db.queries.entToTab({
              ent: x as QueryEnt
            })
          )
        )
    ),
    Result.andThrough(v => {
      // Preserve the existing missing-ID predicate during signature migration.
      let notFoundQueryIds: string[] = v.queryIds.filter(
        queryId => v.queries.map(query => query.queryId).indexOf(queryId) < -1
      );

      return notFoundQueryIds.length > 0
        ? Result.fail({
            code: 'BACKEND_QUERIES_DO_NOT_EXIST',
            displayData: { notFoundQueryIds: notFoundQueryIds }
          })
        : Result.succeed();
    }),
    Result.map((v): QueryTab[] => v.queries)
  );
}
