import {
  type ConnectionOptions,
  type QueryResult,
  Trino,
  type Iterator as TrinoIterator
} from 'trino-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToTrinoOptions } from '#backend/functions/dwh/trino/options-to-trino-options/options-to-trino-options';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export async function fetchTrinoCachedParts(item: {
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

  let trinoConnectionOptions: ConnectionOptions = optionsToTrinoOptions({
    connection: connection
  });

  try {
    let tc: Trino = Trino.create(trinoConnectionOptions);

    let catalog = connection.options.trino.catalog;

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT ${sampleSize}) sub`
      : `"${catalog}"."${schemaName}"."${tableName}"`;

    let sqlText = `SELECT "${columnName}" AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE "${columnName}" IS NOT NULL AND CAST("${columnName}" AS VARCHAR) <> '' GROUP BY "${columnName}" ORDER BY count DESC LIMIT ${cacheLimit}`;

    let result: TrinoIterator<QueryResult> = await tc.query(sqlText);

    let queryResult: IteratorResult<QueryResult, any> = await result.next();

    if (
      isUndefined(queryResult?.value) ||
      isDefined(queryResult?.value?.error)
    ) {
      let errorMsg = isUndefined(queryResult?.value)
        ? 'queryResult.value is not defined'
        : queryResult?.value?.error?.message;

      let cachedPartsResult: CachedPartsResult = {
        values: [],
        errorMessage: `Column cache failed: ${errorMsg}`
      };

      return cachedPartsResult;
    }

    let outputRows: unknown[][] = [];

    while (queryResult !== null) {
      let dataRows = queryResult.value.data ?? [];

      dataRows.forEach((row: any) => {
        outputRows.push(row as unknown[]);
      });

      if (!queryResult.done) {
        queryResult = await result.next();
      } else {
        break;
      }
    }

    let cachedPartsResult: CachedPartsResult = {
      values: outputRows.map(row => ({
        columnValue: String(row[0]),
        count: Number(row[1])
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
