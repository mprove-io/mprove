import { type DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type OptionsToDuckdbOptionsOutput,
  optionsToDuckdbOptions
} from '#backend/functions/dwh/duckdb/options-to-duckdb-options/options-to-duckdb-options';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testDuckdbConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

  let { duckdbConnectionOptions, dbPath }: OptionsToDuckdbOptionsOutput =
    optionsToDuckdbOptions({
      connection: connection
    });

  try {
    let db: DuckDBInstance = await DuckDBInstance.create(
      dbPath,
      duckdbConnectionOptions
    );

    let dc: DuckDBConnection = await db.connect();

    await dc.runAndReadAll('SELECT 1');

    dc.closeSync();

    db.closeSync();

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
