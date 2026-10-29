import {
  type DuckDBConnection,
  DuckDBInstance,
  type DuckDBResultReader
} from '@duckdb/node-api';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type OptionsToDuckdbOptionsOutput,
  optionsToDuckdbOptions
} from '#backend/functions/dwh/duckdb/options-to-duckdb-options/options-to-duckdb-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchDuckdbSample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset } = item;

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

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let reader: DuckDBResultReader = await dc.runAndReadAll(sqlText);

    let resultRows: any[] = reader.getRowObjectsJson() as any[];

    let columnNames: string[] =
      resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

    let rows: string[][] = resultRows.map(row =>
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
  } finally {
    dc?.closeSync();

    duckDbInstance?.closeSync();
  }
}
