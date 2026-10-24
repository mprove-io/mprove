import { getTableColumns } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export function setUndefinedToNull<
  TTable extends PgTable,
  TEntity extends object
>(item: { table: TTable; ents: TEntity[] }): TEntity[] {
  let { table, ents } = item;

  let columns: Record<string, PgColumn> = getTableColumns(table);

  let schemaColumns: Set<string> = new Set(Object.keys(columns));

  let convertedEnts: TEntity[] = ents.map(ent => {
    let entries: [string, unknown][] = Object.entries(ent).map(
      ([key, value]) => [
        key,
        schemaColumns.has(key) && isUndefined(value) ? null : value
      ]
    );

    let convertedEnt: TEntity = Object.fromEntries(entries) as TEntity;

    return convertedEnt;
  });

  return convertedEnts;
}
