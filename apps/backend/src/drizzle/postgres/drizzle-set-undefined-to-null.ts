import { getTableColumns } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { isUndefined } from '#common/functions/is-undefined';

export function setUndefinedToNull<
  TTable extends PgTable,
  TEntity extends object
>(item: { table: TTable; ents?: TEntity[] }): TEntity[] {
  const columns = getTableColumns(item.table);

  const schemaColumns = new Set(Object.keys(columns));

  const processItem = (obj: TEntity): TEntity => {
    const result = {} as TEntity;

    for (const [key, value] of Object.entries(obj)) {
      if (schemaColumns.has(key)) {
        (result as any)[key] = isUndefined(value) ? null : value;
      } else {
        (result as any)[key] = value;
      }
    }
    return result;
  };

  return item.ents.map(x => processItem(x));
}
