import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as MYSQL from 'mysql2/promise';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToMysqlOptions } from '#backend/functions/dwh/mysql/options-to-mysql-options/options-to-mysql-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchMysqlSample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset, cs, logger } =
    item;

  let mysqlConnectionOptions: MYSQL.ConnectionOptions = optionsToMysqlOptions({
    connection: connection
  });

  let mc: MYSQL.Connection;

  try {
    mc = await MYSQL.createConnection(mysqlConnectionOptions);

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT \`${columnName}\` FROM (SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM \`${schemaName}\`.\`${tableName}\` LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let [resultRows]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
      await mc.query(sqlText);

    let dataRows = resultRows as any[];

    let columnNames: string[] =
      dataRows.length > 0 ? Object.keys(dataRows[0]) : [];

    let rows: string[][] = dataRows.map(row =>
      columnNames.map(col => (row[col] === null ? 'NULL' : String(row[col])))
    );

    let fetchSampleResult: FetchSampleResult = {
      columnNames: columnNames,
      rows: rows
    };

    return fetchSampleResult;
  } catch (e: any) {
    let fetchSampleResult: FetchSampleResult = {
      columnNames: [],
      rows: [],
      errorMessage: `Sample fetch failed: ${e.message}`
    };

    return fetchSampleResult;
  } finally {
    if (isDefined(mc)) {
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
  }
}
