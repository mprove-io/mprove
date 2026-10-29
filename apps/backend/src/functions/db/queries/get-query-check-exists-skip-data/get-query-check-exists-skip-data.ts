import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import {
  type QueryEnt,
  queriesTable
} from '#backend/drizzle/postgres/tables/queries';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetQueryCheckExistsSkipDataError } from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';

export async function getQueryCheckExistsSkipData(item: {
  queryId: string;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<QueryTab, GetQueryCheckExistsSkipDataError> {
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
            eq(queriesTable.queryId, v.queryId),
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
    Result.andThen(v =>
      isUndefined(v.queries[0])
        ? Result.fail({ code: 'BACKEND_QUERY_DOES_NOT_EXIST' })
        : Result.succeed(v.queries[0])
    )
  );
}
