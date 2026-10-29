import type {
  PrestoClientConfig,
  PrestoQuery
} from '@prestodb/presto-js-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPrestoClientConfig } from '#backend/functions/dwh/presto/options-to-presto-client-config/options-to-presto-client-config';
import { PrestoClient } from '#backend/functions/dwh/presto/presto-client';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchPrestoSample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset } = item;

  let prestoClientConfig: PrestoClientConfig = optionsToPrestoClientConfig({
    connection: connection
  });

  try {
    let pc: InstanceType<typeof PrestoClient> = new PrestoClient(
      prestoClientConfig
    );

    let catalog = connection.options.presto.catalog;

    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM "${catalog}"."${schemaName}"."${tableName}" OFFSET ${sqlOffset} LIMIT 100`;
    }

    let result: PrestoQuery = await pc.query(sqlText);

    let columns = result.columns;

    let resultRows: { [name: string]: any }[] = result.data.map(r => {
      let dRow: { [name: string]: any } = {};

      columns.forEach((column: any, index: number) => {
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
