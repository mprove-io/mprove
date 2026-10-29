import { type ConnectionOptions, Trino } from 'trino-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToTrinoOptions } from '#backend/functions/dwh/trino/options-to-trino-options/options-to-trino-options';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testTrinoConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

  let trinoConnectionOptions: ConnectionOptions = optionsToTrinoOptions({
    connection: connection
  });

  try {
    let tc: Trino = Trino.create(trinoConnectionOptions);

    await tc.query('SELECT 1');

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
