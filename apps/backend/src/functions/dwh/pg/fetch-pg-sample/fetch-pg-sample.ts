import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPgOptions } from '#backend/functions/dwh/pg/options-to-pg-options/options-to-pg-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

export async function fetchPgSample(item: {
  connection: ConnectionTab;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
}): Promise<FetchSampleResult> {
  let { connection, schemaName, tableName, columnName, offset } = item;

  let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
    optionsToPgOptions({
      connection: connection
    });

  let pgp: pgPromise.IMain<{}, pg.IClient> = pgPromise({ noWarnings: true });

  let pgDb: pgPromise.IDatabase<{}, pg.IClient> = pgp(
    postgresConnectionOptions
  );

  try {
    let sqlText: string;

    if (isDefined(columnName)) {
      sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
    } else {
      let sqlOffset = isDefined(offset) ? offset : 0;

      sqlText = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 100 OFFSET ${sqlOffset}`;
    }

    let resultRows: any[] = await pgDb.any(sqlText);

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
    pgDb.$pool.end();
  }
}
