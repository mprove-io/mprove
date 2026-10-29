import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPgOptions } from '#backend/functions/dwh/pg/options-to-pg-options/options-to-pg-options';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchPgCachedParts(item: {
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

  let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
    optionsToPgOptions({ connection: connection });

  let pgp: pgPromise.IMain<{}, pg.IClient> = pgPromise({ noWarnings: true });

  let pgDb: pgPromise.IDatabase<{}, pg.IClient> = pgp(
    postgresConnectionOptions
  );

  try {
    let sourceSql = isDefined(sampleSize)
      ? `(SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT ${sampleSize}) sub`
      : `"${schemaName}"."${tableName}"`;

    let sqlText = `SELECT "${columnName}" AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE "${columnName}" IS NOT NULL AND CAST("${columnName}" AS TEXT) <> '' GROUP BY "${columnName}" ORDER BY count DESC LIMIT ${cacheLimit}`;

    let resultRows: any[] = await pgDb.any(sqlText);

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
      errorMessage: `Column cache failed: ${e.message}`
    };

    return cachedPartsResult;
  } finally {
    pgDb.$pool.end();
  }
}
