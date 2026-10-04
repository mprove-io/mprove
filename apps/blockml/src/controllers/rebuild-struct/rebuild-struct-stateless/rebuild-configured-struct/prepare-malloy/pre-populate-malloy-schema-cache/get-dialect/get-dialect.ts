import {
  DatabricksDialect,
  type Dialect,
  DuckDBDialect,
  MySQLDialect,
  PostgresDialect,
  SnowflakeDialect,
  StandardSQLDialect,
  TrinoDialect
} from '@malloydata/malloy';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';

export function getDialect(item: {
  connectionType: ConnectionType;
}): Dialect | undefined {
  let { connectionType } = item;

  let dialectMap: Partial<Record<ConnectionType, Dialect>> = {
    ['PostgreSQL']: new PostgresDialect(),
    ['MySQL']: new MySQLDialect(),
    ['BigQuery']: new StandardSQLDialect(),
    ['SnowFlake']: new SnowflakeDialect(),
    ['Databricks']: new DatabricksDialect(),
    ['MotherDuck']: new DuckDBDialect(),
    ['Presto']: new TrinoDialect(),
    ['Trino']: new TrinoDialect()
  };

  return dialectMap[connectionType];
}
