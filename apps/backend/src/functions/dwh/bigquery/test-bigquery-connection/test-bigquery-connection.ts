import { BigQuery, type BigQueryOptions } from '@google-cloud/bigquery';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToBigqueryOptions } from '#backend/functions/dwh/bigquery/options-to-bigquery-options/options-to-bigquery-options';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testBigqueryConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;
  let bigqueryConnectionOptions: BigQueryOptions = optionsToBigqueryOptions({
    connection: connection
  });

  try {
    let bigquery: BigQuery = new BigQuery(bigqueryConnectionOptions);

    await bigquery.query('SELECT 1');

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
