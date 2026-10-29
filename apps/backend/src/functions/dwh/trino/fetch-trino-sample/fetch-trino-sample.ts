import {
  type ConnectionOptions,
  type QueryResult,
  Trino,
  type Iterator as TrinoIterator
} from 'trino-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToTrinoOptions } from '#backend/functions/dwh/trino/options-to-trino-options/options-to-trino-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchTrinoSample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset } = item;

  let trinoConnectionOptions: ConnectionOptions = optionsToTrinoOptions({
    connection: connection
  });

  try {
    let tc: Trino = Trino.create(trinoConnectionOptions);

    let catalog = connection.options.trino.catalog;

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM "${catalog}"."${schemaName}"."${tableName}" OFFSET ${sqlOffset} LIMIT 100`;
    }

    let result: TrinoIterator<QueryResult> = await tc.query(sqlText);

    let queryResult: IteratorResult<QueryResult, any> = await result.next();

    if (
      isUndefined(queryResult?.value) ||
      isDefined(queryResult?.value?.error)
    ) {
      let errorMsg = isUndefined(queryResult?.value)
        ? 'queryResult.value is not defined'
        : queryResult?.value?.error?.message;

      let fetchSampleResult: FetchSampleResult = {
        columnNames: [],
        rows: [],
        errorMessage: `Sample fetch failed: ${errorMsg}`
      };

      return fetchSampleResult;
    }

    let trinoColumns = queryResult.value.columns;

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

    let resultRows: { [name: string]: any }[] = outputRows.map(r => {
      let dRow: { [name: string]: any } = {};

      trinoColumns.forEach((column: any, index: number) => {
        dRow[column.name as string] = r[index];
      });

      return dRow;
    });

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
  }
}
