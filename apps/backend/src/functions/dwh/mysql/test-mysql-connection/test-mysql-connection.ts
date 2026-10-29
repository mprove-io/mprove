import * as MYSQL from 'mysql2/promise';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToMysqlOptions } from '#backend/functions/dwh/mysql/options-to-mysql-options/options-to-mysql-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testMysqlConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

  let mysqlConnectionOptions: MYSQL.ConnectionOptions = optionsToMysqlOptions({
    connection: connection
  });

  try {
    let errorMessage: string;

    let mc: void | MYSQL.Connection = await MYSQL.createConnection(
      mysqlConnectionOptions
    ).catch(e => {
      errorMessage = `Connection failed: ${e.message}`;
    });

    if (isDefined(errorMessage) === true) {
      let testConnectionResult: TestConnectionResult = {
        isSuccess: false,
        errorMessage: errorMessage
      };

      return testConnectionResult;
    } else if (!mc) {
      let testConnectionResult: TestConnectionResult = {
        isSuccess: false,
        errorMessage: 'Connection failed'
      };

      return testConnectionResult;
    }

    await mc.ping();

    await mc.end();

    let testConnectionResult: TestConnectionResult = {
      isSuccess: true,
      errorMessage: undefined
    };

    return testConnectionResult;
  } catch (err: any) {
    let testConnectionResult: TestConnectionResult = {
      isSuccess: false,
      errorMessage: `Connection failed: ${err.message}`
    };

    return testConnectionResult;
  }
}
