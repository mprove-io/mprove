import {
  BigQuery,
  type BigQueryOptions,
  type QueryRowsResponse
} from '@google-cloud/bigquery';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToBigqueryOptions } from '#backend/functions/dwh/bigquery/options-to-bigquery-options/options-to-bigquery-options';
import type { CachedPartsResult } from '#backend/types/cached-parts-result';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchBigqueryCachedParts(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName: string;
  sampleSize?: number;
  cacheLimit: number;
}): Promise<CachedPartsResult> {
  let {
    connection,
    schemaName,
    tableName,
    columnName,
    sampleSize,
    cacheLimit
  } = item;

  let bigqueryConnectionOptions: BigQueryOptions = optionsToBigqueryOptions({
    connection: connection
  });

  try {
    let bigquery: BigQuery = new BigQuery(bigqueryConnectionOptions);

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT ${sampleSize}) sub`
      : `\`${schemaName}\`.\`${tableName}\``;

    let sqlText = `SELECT \`${columnName}\` AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE \`${columnName}\` IS NOT NULL AND CAST(\`${columnName}\` AS STRING) <> '' GROUP BY \`${columnName}\` ORDER BY count DESC LIMIT ${cacheLimit}`;

    let [resultRows]: QueryRowsResponse = await bigquery.query(sqlText);

    let cachedPartsResult: CachedPartsResult = {
      values: resultRows.map((row: any) => ({
        columnValue: String(row.column_value),
        count: Number(row.count)
      }))
    };

    return cachedPartsResult;
  } catch (e: any) {
    let cachedPartsResult: CachedPartsResult = {
      values: [],
      errorMessage: `Column cache failed: ${e.message}`
    };

    return cachedPartsResult;
  }
}
