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
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchDatabricksSample(item: {
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

  let config: OptionsToDatabricksConfigOutput = optionsToDatabricksConfig({
    connection: connection
  });

  let client: DBSQLClient = new DBSQLClient({ logger: quietLogger });

  try {
    await client.connect(buildDatabricksConnectOptions({ config: config }));

    let session: IDBSQLSession = await client.openSession();

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT \`${columnName}\` FROM (SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM \`${schemaName}\`.\`${tableName}\` LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let operation: IOperation = await session.executeStatement(sqlText, {
      runAsync: true
    });

    let resultRows: any[] = (await operation.fetchAll()) as any[];

    await operation.close();

    await session.close();

    let columnNames: string[] =
      resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

    let rows: string[][] = resultRows.map(row =>
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
