import {
  type DuckDBConnection,
  DuckDBInstance,
  type DuckDBResultReader
} from '@duckdb/node-api';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import {
  type OptionsToDuckdbOptionsOutput,
  optionsToDuckdbOptions
} from '#backend/functions/dwh/duckdb/options-to-duckdb-options/options-to-duckdb-options';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchDuckdbCachedParts(item: {
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

  let { duckdbConnectionOptions, dbPath }: OptionsToDuckdbOptionsOutput =
    optionsToDuckdbOptions({
      connection: connection
    });

  let duckDbInstance: DuckDBInstance;

  let dc: DuckDBConnection;

  try {
    duckDbInstance = await DuckDBInstance.create(
      dbPath,
      duckdbConnectionOptions
    );

    dc = await duckDbInstance.connect();

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT ${sampleSize}) sub`
      : `"${schemaName}"."${tableName}"`;

    let sqlText = `SELECT "${columnName}" AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE "${columnName}" IS NOT NULL AND CAST("${columnName}" AS VARCHAR) <> '' GROUP BY "${columnName}" ORDER BY count DESC LIMIT ${cacheLimit}`;

    let reader: DuckDBResultReader = await dc.runAndReadAll(sqlText);

    let resultRows: any[] = reader.getRowObjectsJson() as any[];

    let cachedPartsResult: CachedPartsResult = {
      values: resultRows.map(row => ({
        columnValue: String(row.column_value),
        count: Number(row.count)
      }))
    };

    return cachedPartsResult;
  } catch (e: any) {
    let cachedPartsResult: CachedPartsResult = {
      values: [],
      errorMessage: `Cached column failed: ${e.message}`
    };

    return cachedPartsResult;
  } finally {
    dc?.closeSync();

    duckDbInstance?.closeSync();
  }
}
