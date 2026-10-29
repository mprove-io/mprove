import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema-postgres';
import {
  type DbEntityRegistry,
  type DbTableKey,
  dbEntityRegistry,
  dbTableKeys
} from '#backend/services/db/db-entity-registry';
import {
  DbTable,
  type DbTableExistsQuery,
  type DbTableQuery
} from '#backend/services/db/db-table';
import type { TabService } from '#backend/services/tab/tab.service';

export type DbTableRegistry = {
  [Key in DbTableKey]: DbTable<Key>;
};

export function createDbTableRegistry(item: {
  drizzle: NodePgDatabase<typeof schemaPostgres>;
  tabService: TabService;
}): DbTableRegistry {
  let { drizzle, tabService } = item;

  let entityRegistry: DbEntityRegistry = dbEntityRegistry;

  let queryMap: {
    [Key in DbTableKey as `${Key}Table`]: DbTableQuery<Key>;
  } = drizzle.query;

  let existsQueryMap: {
    [Key in DbTableKey as `${Key}Table`]: DbTableExistsQuery<Key>;
  } = drizzle.query;

  let entries: [DbTableKey, DbTable<DbTableKey>][] = dbTableKeys.map(
    (key: DbTableKey): [DbTableKey, DbTable<DbTableKey>] => {
      let table: DbTable<DbTableKey> = new DbTable<DbTableKey>({
        query: queryMap[`${key}Table`],
        existsQuery: existsQueryMap[`${key}Table`],
        entityConfig: entityRegistry[key],
        tabService: tabService
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
