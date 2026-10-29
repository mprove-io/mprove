import type {
  PrestoClientConfig,
  PrestoQuery
} from '@prestodb/presto-js-client';
import { and, eq } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { optionsToPrestoClientConfig } from '#backend/functions/dwh/presto/options-to-presto-client-config/options-to-presto-client-config';
import { PrestoClient } from '#backend/functions/dwh/presto/presto-client';
import { processPrestoError } from '#backend/functions/dwh/presto/run-presto-query/process-presto-error/process-presto-error';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runPrestoQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  projectId: string;
  querySql: string;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, db } = item;

  let prestoClientConfig: PrestoClientConfig = optionsToPrestoClientConfig({
    connection: connection
  });

  let pc: InstanceType<typeof PrestoClient> = new PrestoClient(
    prestoClientConfig
  );

  await pc
    .query(querySql)
    .then(async (result: PrestoQuery) => {
      let columns = result.columns;

      let data: { [name: string]: any }[] = result.data.map(r => {
        let dRow: { [name: string]: any } = {};

        columns.forEach((column: any, index: number) => {
          dRow[column.name as string] = r[index];
        });

        return dRow;
      });

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
      processPrestoError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );
}
