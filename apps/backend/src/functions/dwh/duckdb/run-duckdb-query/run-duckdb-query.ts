import {
  type DuckDBConnection,
  DuckDBInstance,
  type Json
} from '@duckdb/node-api';
import type { DuckDBResultReader } from '@duckdb/node-api/lib/DuckDBResultReader';
import { and, eq } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import {
  type OptionsToDuckdbOptionsOutput,
  optionsToDuckdbOptions
} from '#backend/functions/dwh/duckdb/options-to-duckdb-options/options-to-duckdb-options';
import { processDuckdbError } from '#backend/functions/dwh/duckdb/run-duckdb-query/process-duckdb-error/process-duckdb-error';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runDuckdbQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  projectId: string;
  querySql: string;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, db } = item;

  let { duckdbConnectionOptions, dbPath }: OptionsToDuckdbOptionsOutput =
    optionsToDuckdbOptions({
      connection: connection
    });

  let duckdbInstance: DuckDBInstance = await DuckDBInstance.create(
    dbPath,
    duckdbConnectionOptions
  );

  let dc: DuckDBConnection = await duckdbInstance.connect();

  await dc
    .runAndReadAll(querySql)
    .then(async (reader: DuckDBResultReader) => {
      let data: Record<string, Json>[] = reader.getRowObjectsJson();
      // let data: Record<string, Json>[] = reader.getRowObjects();

      // data = JSON.parse(
      //   JSON.stringify(data, (_key, value) => {
      //     if (typeof value === 'bigint') {
      //       return Number(value);
      //     }
      //     return value;
      //   })
      // );

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
      processDuckdbError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );

  dc.closeSync();

  duckdbInstance.closeSync();
}
