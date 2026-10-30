import { DBSQLClient } from '@databricks/sql';
import type IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';
import type IOperation from '@databricks/sql/dist/contracts/IOperation';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { buildDatabricksConnectOptions } from '#backend/functions/dwh/databricks/build-databricks-connect-options/build-databricks-connect-options';
import {
  type OptionsToDatabricksConfigOutput,
  optionsToDatabricksConfig
} from '#backend/functions/dwh/databricks/options-to-databricks-config/options-to-databricks-config';
import { quietLogger } from '#backend/functions/dwh/databricks/quiet-logger';
import { processDatabricksError } from '#backend/functions/dwh/databricks/run-databricks-query/process-databricks-error/process-databricks-error';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runDatabricksQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  querySql: string;
  projectId: string;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, cs, logger, db } =
    item;

  let config: OptionsToDatabricksConfigOutput = optionsToDatabricksConfig({
    connection: connection
  });

  let client: DBSQLClient = new DBSQLClient({ logger: quietLogger });

  try {
    await client.connect(buildDatabricksConnectOptions({ config: config }));

    let session: IDBSQLSession = await client.openSession();

    let operation: IOperation = await session.executeStatement(querySql, {
      runAsync: true
    });

    let rows: object[] = await operation.fetchAll();

    await operation.close();

    await session.close();

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
      q.data = rows;
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
  } catch (e) {
    await processDatabricksError({
      db: db,
      e: e,
      queryId: queryId,
      queryJobId: queryJobId,
      projectId: projectId
    });
  } finally {
    try {
      await client.close();
    } catch (err: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION',
          originalError: err
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }
  }
}
