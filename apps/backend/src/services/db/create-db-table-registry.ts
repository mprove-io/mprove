import type { DbExtra } from '#backend/drizzle/drizzle.module';
import {
  type DbEntityRegistry,
  type DbTableKey,
  dbEntityRegistry,
  dbTableKeys
} from '#backend/services/db/db-entity-registry';
import {
  DbTable,
  type DbTableContext,
  type DbTableExistsQuery,
  type DbTableQuery
} from '#backend/services/db/db-table';

export type DbTableRegistry = {
  [Key in DbTableKey]: DbTable<Key>;
};

export function createDbTableRegistry(item: {
  dbExtra: DbExtra;
  context: DbTableContext;
}): DbTableRegistry {
  let { dbExtra, context } = item;

  let entityRegistry: DbEntityRegistry = dbEntityRegistry;

  let queryMap: {
    [Key in DbTableKey as `${Key}Table`]: DbTableQuery<Key>;
  } = dbExtra.drizzle.query;

  let existsQueryMap: {
    [Key in DbTableKey as `${Key}Table`]: DbTableExistsQuery<Key>;
  } = dbExtra.drizzle.query;

  let entries: [DbTableKey, DbTable<DbTableKey>][] = dbTableKeys.map(
    (key: DbTableKey): [DbTableKey, DbTable<DbTableKey>] => {
      let table: DbTable<DbTableKey> = new DbTable({
        key: key,
        query: queryMap[`${key}Table`],
        existsQuery: existsQueryMap[`${key}Table`],
        entityConfig: entityRegistry[key],
        context: context
      });

      return [key, table];
    }
  );

  // Key enumeration loses key/value correlation, so keep the assertion at this
  // construction boundary. Every entity config contributes exactly one table.
  let tableRegistry: DbTableRegistry = Object.fromEntries(
    entries
  ) as DbTableRegistry;

  return tableRegistry;
}
