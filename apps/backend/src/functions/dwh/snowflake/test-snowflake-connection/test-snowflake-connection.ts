import snowflake from 'snowflake-sdk';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToSnowflakeOptions } from '#backend/functions/dwh/snowflake/options-to-snowflake-options/options-to-snowflake-options';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testSnowflakeConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

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

          return;
        }

        conn.execute({
          sqlText: 'SELECT 1',
          complete: (err, stmt, rows) => {
            if (err) {
              reject(err);
            } else {
              conn.destroy(destroyErr => {
                if (destroyErr) {
                  reject(destroyErr);
                } else {
                  resolve();
                }
              });
            }
          }
        });
      });
    });

    let testConnectionResult: TestConnectionResult = {
      isSuccess: true,
      errorMessage: undefined
    };

    return testConnectionResult;
  } catch (err: any) {
    // snowflakeConnection?.destroy(destroyErr => {
    //   if (destroyErr) {
    //     logToConsoleBackend({
    //       log: new ServerError({
    //         message: 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION',
    //         originalError: destroyErr
    //       }),
    //       logLevel: 'Error',
    //       logger: this.logger,
    //       cs: this.cs
    //     });
    //   }
    // });

    let testConnectionResult: TestConnectionResult = {
      isSuccess: false,
      errorMessage: `Connection failed: ${err.message}`
    };

    return testConnectionResult;
  }
}
