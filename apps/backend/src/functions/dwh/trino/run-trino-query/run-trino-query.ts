import { and, eq } from 'drizzle-orm';
import { type ConnectionOptions, type QueryResult, Trino } from 'trino-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { optionsToTrinoOptions } from '#backend/functions/dwh/trino/options-to-trino-options/options-to-trino-options';
import { processTrinoError } from '#backend/functions/dwh/trino/run-trino-query/process-trino-error/process-trino-error';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export async function runTrinoQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  projectId: string;
  querySql: string;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, db } = item;

  let trinoConnectionOptions: ConnectionOptions = optionsToTrinoOptions({
    connection: connection
  });

  let tc: Trino = Trino.create(trinoConnectionOptions);

  await tc
    .query(querySql)
    .then(async result => {
      let queryResult: IteratorResult<QueryResult, any> = await result.next();

      let q: QueryTab = await db.queries.findFirstUnwrap({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      });

      if (isDefined(q) || isUndefined(queryResult?.value)) {
        if (
          isUndefined(queryResult?.value) ||
          isDefined(queryResult?.value?.error)
        ) {
          q.status = 'Error';
          q.data = [];
          q.queryJobId = undefined;
          q.lastErrorMessage = isUndefined(queryResult?.value)
            ? 'queryResult.value is not defined'
            : queryResult?.value?.error?.message;
          q.lastErrorTs = makeTsNumber();
        } else {
          let columns = queryResult.value.columns;

          let outputRows: unknown[][] = [];

          while (queryResult !== null) {
            let rows = queryResult.value.data ?? [];

            rows.forEach((row: any) => {
              outputRows.push(row as unknown[]);
            });

            if (!queryResult.done) {
              queryResult = await result.next();
            } else {
              break;
            }
          }

          let data: { [name: string]: any }[] = outputRows.map(r => {
            let dRow: { [name: string]: any } = {};

            columns.forEach((column: any, index: number) => {
              dRow[column.name as string] = r[index];
            });

            return dRow;
          });

          q.status = 'Completed';
          q.queryJobId = undefined;
          q.data = data;
          q.lastCompleteTs = makeTsNumber();
          q.lastCompleteDuration = Math.floor(
            (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
          );
        }

        await db.writeUnwrap({
          insertOrUpdate: {
            queries: [q]
          }
        });
      }
    })
    .catch(async e =>
      processTrinoError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );
}
