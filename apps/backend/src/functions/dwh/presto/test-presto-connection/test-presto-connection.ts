import type { PrestoClientConfig } from '@prestodb/presto-js-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPrestoClientConfig } from '#backend/functions/dwh/presto/options-to-presto-client-config/options-to-presto-client-config';
import { PrestoClient } from '#backend/functions/dwh/presto/presto-client';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testPrestoConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

  let prestoClientConfig: PrestoClientConfig = optionsToPrestoClientConfig({
    connection: connection
  });

  try {
    let pc: InstanceType<typeof PrestoClient> = new PrestoClient(
      prestoClientConfig
    );

    await pc.query('SELECT 1');

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
