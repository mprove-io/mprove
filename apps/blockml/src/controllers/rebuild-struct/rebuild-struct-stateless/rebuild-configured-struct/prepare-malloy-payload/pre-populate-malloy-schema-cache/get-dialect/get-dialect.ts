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
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

export function getDialect(item: {
  connectionType: ConnectionTypeEnum;
}): Dialect | undefined {
  let { connectionType } = item;

  let dialectMap: Partial<Record<ConnectionTypeEnum, Dialect>> = {
    [ConnectionTypeEnum.PostgreSQL]: new PostgresDialect(),
    [ConnectionTypeEnum.MySQL]: new MySQLDialect(),
    [ConnectionTypeEnum.BigQuery]: new StandardSQLDialect(),
    [ConnectionTypeEnum.SnowFlake]: new SnowflakeDialect(),
    [ConnectionTypeEnum.Databricks]: new DatabricksDialect(),
    [ConnectionTypeEnum.MotherDuck]: new DuckDBDialect(),
    [ConnectionTypeEnum.Presto]: new TrinoDialect(),
    [ConnectionTypeEnum.Trino]: new TrinoDialect()
  };

  return dialectMap[connectionType];
}
