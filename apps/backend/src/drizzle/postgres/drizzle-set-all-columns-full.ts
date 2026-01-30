import { getTableColumns, sql } from 'drizzle-orm';
import {
  getTableConfig,
  PgTable,
  PgUpdateSetSource
} from 'drizzle-orm/pg-core';

// https://github.com/drizzle-team/drizzle-orm/issues/1728

export function drizzleSetAllColumnsFull<TTable extends PgTable>(item: {
  table: TTable;
  ignoreColumnNames?: string[];
}): PgUpdateSetSource<TTable> {
  let { table, ignoreColumnNames } = item;

  ignoreColumnNames = ignoreColumnNames || [];

  let columns = getTableColumns(table);

  let tableConfig = getTableConfig(table);

  let tableName = tableConfig.name;

  let conflictUpdateSet = {} as PgUpdateSetSource<TTable>;

  for (const [columnName, columnInfo] of Object.entries(columns)) {
    if (ignoreColumnNames.indexOf(columnName) < 0) {
      conflictUpdateSet[columnName as keyof PgUpdateSetSource<TTable>] =
        sql.raw(`excluded.${columnInfo.name}`);
    }
  }

  return conflictUpdateSet;
}
