import { DBSQLClient } from '@databricks/sql';
import type IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';
import type IOperation from '@databricks/sql/dist/contracts/IOperation';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { buildDatabricksConnectOptions } from '#backend/functions/dwh/databricks/build-databricks-connect-options/build-databricks-connect-options';
import {
  type OptionsToDatabricksConfigOutput,
  optionsToDatabricksConfig
} from '#backend/functions/dwh/databricks/options-to-databricks-config/options-to-databricks-config';
import { quietLogger } from '#backend/functions/dwh/databricks/quiet-logger';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchDatabricksCachedParts(item: {
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

  let config: OptionsToDatabricksConfigOutput = optionsToDatabricksConfig({
    connection: connection
  });

  let client: DBSQLClient = new DBSQLClient({ logger: quietLogger });

  try {
    await client.connect(buildDatabricksConnectOptions({ config: config }));

    let session: IDBSQLSession = await client.openSession();

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT ${sampleSize}) sub`
      : `\`${schemaName}\`.\`${tableName}\``;

    let sqlText = `SELECT \`${columnName}\` AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE \`${columnName}\` IS NOT NULL AND CAST(\`${columnName}\` AS STRING) <> '' GROUP BY \`${columnName}\` ORDER BY count DESC LIMIT ${cacheLimit}`;

    let operation: IOperation = await session.executeStatement(sqlText, {
      runAsync: true
    });

    let resultRows: any[] = (await operation.fetchAll()) as any[];

    await operation.close();

    await session.close();

    let cachedPartsResult: CachedPartsResult = {
      values: resultRows.map(row => ({
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
