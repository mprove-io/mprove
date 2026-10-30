import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as MYSQL from 'mysql2/promise';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { optionsToMysqlOptions } from '#backend/functions/dwh/mysql/options-to-mysql-options/options-to-mysql-options';
import { processMysqlError } from '#backend/functions/dwh/mysql/run-mysql-query/process-mysql-error/process-mysql-error';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runMysqlQuery(item: {
  connection: ConnectionTab;
  queryJobId: string;
  queryId: string;
  projectId: string;
  querySql: string;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
  db: DbService;
}): Promise<void> {
  let { connection, queryJobId, queryId, querySql, projectId, cs, logger, db } =
    item;

  let mysqlConnectionOptions: MYSQL.ConnectionOptions = optionsToMysqlOptions({
    connection: connection
  });

  let mc: void | MYSQL.Connection = await MYSQL.createConnection(
    mysqlConnectionOptions
  ).catch(async e =>
    processMysqlError({
      db: db,
      e: e,
      queryId: queryId,
      queryJobId: queryJobId,
      projectId: projectId
    })
  );

  if (!mc) {
    return;
  }

  // packages/malloy-db-mysql/src/mysql_connection.ts
  await mc
    .query(
      "set @@session.time_zone = 'UTC';" +
        'SET SESSION group_concat_max_len = 10000000;' +
        "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
    )
    .catch(async e =>
      processMysqlError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );

  await mc
    .query(querySql)
    .then(async (result: [MYSQL.QueryResult, MYSQL.FieldPacket[]]) => {
      let data = result[0];

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
      processMysqlError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      })
    );

  mc.end().catch(er => {
    logToConsoleBackend({
      log: new ServerError({
        message: 'BACKEND_MYSQL_CONNECTION_CLOSE_ERROR',
        originalError: er
      }),
      logLevel: 'Error',
      logger: logger,
      cs: cs
    });
  });
}
