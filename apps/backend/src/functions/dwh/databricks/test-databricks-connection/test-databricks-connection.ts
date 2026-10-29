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
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testDatabricksConnection(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<TestConnectionResult> {
  let { connection, cs, logger } = item;

  let config: OptionsToDatabricksConfigOutput = optionsToDatabricksConfig({
    connection: connection
  });

  let client: DBSQLClient = new DBSQLClient({ logger: quietLogger });

  try {
    await client.connect(buildDatabricksConnectOptions({ config: config }));

    let session: IDBSQLSession = await client.openSession();

    let operation: IOperation = await session.executeStatement('SELECT 1', {
      runAsync: true
    });

    await operation.fetchAll();

    await operation.close();

    await session.close();

    await client.close();

    let testConnectionResult: TestConnectionResult = {
      isSuccess: true,
      errorMessage: undefined
    };

    return testConnectionResult;
  } catch (err: any) {
    try {
      await client.close();
    } catch (closeErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION',
          originalError: closeErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }

    let testConnectionResult: TestConnectionResult = {
      isSuccess: false,
      errorMessage: `Connection failed: ${err.message}`
    };

    return testConnectionResult;
  }
}
