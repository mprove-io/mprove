import { and, eq } from 'drizzle-orm';
import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { optionsToPgOptions } from '#backend/functions/dwh/pg/options-to-pg-options/options-to-pg-options';
import { processPgError } from '#backend/functions/dwh/pg/run-pg-query/process-pg-error/process-pg-error';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runPgQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  projectId: string;
  querySql: string;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, db } = item;

  let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
    optionsToPgOptions({
      connection: connection
    });

  let pgp: pgPromise.IMain<{}, pg.IClient> = pgPromise({ noWarnings: true });

  let pgDb: pgPromise.IDatabase<{}, pg.IClient> = pgp(
    postgresConnectionOptions
  );

  await pgDb
    .any(querySql)
    .then(async (data: any) => {
      let q: QueryTab = await db.queries.findFirstUnwrap({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      });

      if (isDefined(q)) {
        q.status = 'Completed';
        q.queryJobId = undefined;
        q.data = data;
        q.lastCompleteTs = makeTsNumber();
        q.lastCompleteDuration = Math.floor(
          (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
        );

        await db.writeUnwrap({
          insertOrUpdate: {
            queries: [q]
          }
        });
      }
    })
    .catch(async e =>
      processPgError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );

  pgDb.$pool.end();
}
