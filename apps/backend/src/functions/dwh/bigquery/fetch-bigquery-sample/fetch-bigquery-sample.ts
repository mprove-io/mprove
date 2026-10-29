import {
  BigQuery,
  type BigQueryOptions,
  type QueryRowsResponse
} from '@google-cloud/bigquery';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToBigqueryOptions } from '#backend/functions/dwh/bigquery/options-to-bigquery-options/options-to-bigquery-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchBigquerySample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset } = item;

  let bigqueryConnectionOptions: BigQueryOptions = optionsToBigqueryOptions({
    connection: connection
  });

  try {
    let bigquery: BigQuery = new BigQuery(bigqueryConnectionOptions);

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT \`${columnName}\` FROM (SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM \`${schemaName}\`.\`${tableName}\` LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let [resultRows]: QueryRowsResponse = await bigquery.query(sqlText);

    let columnNames: string[] =
      resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

    let rows: string[][] = resultRows.map((row: any) =>
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
  }
}
