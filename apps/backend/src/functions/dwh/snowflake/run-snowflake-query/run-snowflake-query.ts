import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import snowflake from 'snowflake-sdk';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { optionsToSnowflakeOptions } from '#backend/functions/dwh/snowflake/options-to-snowflake-options/options-to-snowflake-options';
import { processSnowflakeError } from '#backend/functions/dwh/snowflake/run-snowflake-query/process-snowflake-error/process-snowflake-error';
import { snowflakeConnectionExecute } from '#backend/functions/dwh/snowflake/snowflake-connection-execute/snowflake-connection-execute';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runSnowflakeQuery(item: {
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

  let snoflakeOptions: snowflake.ConnectionOptions = optionsToSnowflakeOptions({
    connection: connection
  });

  let snowflakeConnection: snowflake.Connection =
    snowflake.createConnection(snoflakeOptions);

  snowflakeConnection.connect((err, conn) => {
    if (err) {
      void processSnowflakeError({
        db: db,
        e: err,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      });
    }
  });

  // let self = this;

  // snowflakeConnection.execute({
  //   sqlText: query.sql,
  //   complete: function (err, stmt, rows) {
  //     if (err) {
  //       self.getQueryError({
  //         queryJobId: queryJobId,
  //         query: query,
  //         e: err
  //       });
  //       self.destroyConnection(snowflakeConnection);
  //     } else {
  //       self.getQueryResults({
  //         queryJobId: queryJobId,
  //         query: query,
  //         data: { stmt, rows }
  //       });
  //       self.destroyConnection(snowflakeConnection);
  //     }
  //   }
  // });

  await snowflakeConnectionExecute({
    sfConnection: snowflakeConnection,
    execOptions: {
      sqlText: querySql
    }
  })
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
        q.data = data.rows;
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
    .catch(async e => {
      await processSnowflakeError({
        db: db,
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      });
    });

  snowflakeConnection.destroy((err, conn) => {
    if (err) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION',
          originalError: err
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }
  });
}
