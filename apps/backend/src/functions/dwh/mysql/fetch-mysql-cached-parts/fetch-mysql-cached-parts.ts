import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as MYSQL from 'mysql2/promise';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToMysqlOptions } from '#backend/functions/dwh/mysql/options-to-mysql-options/options-to-mysql-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchMysqlCachedParts(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName: string;
  sampleSize?: number;
  cacheLimit: number;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<CachedPartsResult> {
  let {
    connection,
    schemaName,
    tableName,
    columnName,
    sampleSize,
    cacheLimit,
    cs,
    logger
  } = item;

  let mysqlConnectionOptions: MYSQL.ConnectionOptions = optionsToMysqlOptions({
    connection: connection
  });

  let mc: MYSQL.Connection;

  try {
    mc = await MYSQL.createConnection(mysqlConnectionOptions);

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT ${sampleSize}) sub`
      : `\`${schemaName}\`.\`${tableName}\``;

    let sqlText = `SELECT \`${columnName}\` AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE \`${columnName}\` IS NOT NULL AND CAST(\`${columnName}\` AS CHAR) <> '' GROUP BY \`${columnName}\` ORDER BY count DESC LIMIT ${cacheLimit}`;

    let [resultRows]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
      await mc.query(sqlText);

    let dataRows = resultRows as any[];

    let cachedPartsResult: CachedPartsResult = {
      values: dataRows.map(row => ({
        columnValue: String(row.column_value),
        count: Number(row.count)
      }))
    };

    return cachedPartsResult;
  } catch (e: any) {
    let cachedPartsResult: CachedPartsResult = {
      values: [],
      errorMessage: `Column cache failed: ${e.message}`
    };

    return cachedPartsResult;
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
