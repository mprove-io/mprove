import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import snowflake from 'snowflake-sdk';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToSnowflakeOptions } from '#backend/functions/dwh/snowflake/options-to-snowflake-options/options-to-snowflake-options';
import { snowflakeConnectionExecute } from '#backend/functions/dwh/snowflake/snowflake-connection-execute/snowflake-connection-execute';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchSnowflakeCachedParts(item: {
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

  let snoflakeOptions: snowflake.ConnectionOptions = optionsToSnowflakeOptions({
    connection: connection
  });

  let snowflakeConnection: snowflake.Connection =
    snowflake.createConnection(snoflakeOptions);

  try {
    await new Promise<void>((resolve, reject) => {
      snowflakeConnection.connect((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT ${sampleSize}) sub`
      : `"${schemaName}"."${tableName}"`;

    let sqlText = `SELECT "${columnName}" AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE "${columnName}" IS NOT NULL AND CAST("${columnName}" AS VARCHAR) <> '' GROUP BY "${columnName}" ORDER BY count DESC LIMIT ${cacheLimit}`;

    let result: any = await snowflakeConnectionExecute({
      sfConnection: snowflakeConnection,
      execOptions: {
        sqlText: sqlText
      }
    });

    let resultRows = result.rows as any[];

    let cachedPartsResult: CachedPartsResult = {
      values: resultRows.map(row => ({
        columnValue: String(row.COLUMN_VALUE),
        count: Number(row.COUNT)
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
    snowflakeConnection.destroy(destroyErr => {
      if (destroyErr) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION',
            originalError: destroyErr
          }),
          logLevel: 'Error',
          logger: logger,
          cs: cs
        });
      }
    });
  }
}
