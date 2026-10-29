import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import snowflake from 'snowflake-sdk';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToSnowflakeOptions } from '#backend/functions/dwh/snowflake/options-to-snowflake-options/options-to-snowflake-options';
import { snowflakeConnectionExecute } from '#backend/functions/dwh/snowflake/snowflake-connection-execute/snowflake-connection-execute';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchSnowflakeSample(item: {
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

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let result: any = await snowflakeConnectionExecute({
      sfConnection: snowflakeConnection,
      execOptions: {
        sqlText: sqlText
      }
    });

    let resultRows = result.rows as any[];

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
