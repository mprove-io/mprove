import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { QueryTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import type { DbService } from '#backend/services/db/db.service';
import type { GetQueriesCheckExistError } from '#common/types/backend/function-errors/get-queries-check-exist-error';

export async function getQueriesCheckExist(item: {
  queryIds: string[];
  projectId: string;
  db: DbService;
}): Result.ResultAsync<QueryTab[], GetQueriesCheckExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('queries', v =>
      v.db.queries.findMany({
        where: and(
          inArray(queriesTable.queryId, v.queryIds),
          eq(queriesTable.projectId, v.projectId)
        )
      })
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
