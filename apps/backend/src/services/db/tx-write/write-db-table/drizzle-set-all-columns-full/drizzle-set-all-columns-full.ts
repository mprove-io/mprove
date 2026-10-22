import { getTableColumns, sql } from 'drizzle-orm';
import type { PgColumn, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';

// https://github.com/drizzle-team/drizzle-orm/issues/1728

export function drizzleSetAllColumnsFull<TTable extends PgTable>(item: {
  table: TTable;
  ignoreColumnNames?: string[];
}): PgUpdateSetSource<TTable> {
  let { table, ignoreColumnNames } = item;

  ignoreColumnNames = ignoreColumnNames ?? [];

  let columns: Record<string, PgColumn> = getTableColumns(table);

  let conflictUpdateSet: PgUpdateSetSource<TTable> = {};

  Object.entries(columns).forEach(([columnName, columnInfo]) => {
    if (ignoreColumnNames.indexOf(columnName) < 0) {
      conflictUpdateSet[columnName as keyof PgUpdateSetSource<TTable>] =
        sql.raw(`excluded.${columnInfo.name}`);
    }
  });

  return conflictUpdateSet;
}
