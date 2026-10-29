import type {
  PrestoClientConfig,
  PrestoQuery
} from '@prestodb/presto-js-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToPrestoClientConfig } from '#backend/functions/dwh/presto/options-to-presto-client-config/options-to-presto-client-config';
import { PrestoClient } from '#backend/functions/dwh/presto/presto-client';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function fetchPrestoCachedParts(item: {
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

  let prestoClientConfig: PrestoClientConfig = optionsToPrestoClientConfig({
    connection: connection
  });

  try {
    let pc: InstanceType<typeof PrestoClient> = new PrestoClient(
      prestoClientConfig
    );

    let catalog = connection.options.presto.catalog;

    let sourceSql = isDefined(sampleSize)
      ? `(SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT ${sampleSize}) sub`
      : `"${catalog}"."${schemaName}"."${tableName}"`;

    let sqlText = `SELECT "${columnName}" AS column_value, COUNT(*) AS count FROM ${sourceSql} WHERE "${columnName}" IS NOT NULL AND CAST("${columnName}" AS VARCHAR) <> '' GROUP BY "${columnName}" ORDER BY count DESC LIMIT ${cacheLimit}`;

    let result: PrestoQuery = await pc.query(sqlText);

    let cachedPartsResult: CachedPartsResult = {
      values: result.data.map(row => ({
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
