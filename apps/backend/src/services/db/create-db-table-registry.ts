import type { DbExtra } from '#backend/drizzle/drizzle.module';
import {
  type DbReadEntityRegistry,
  type DbReadTableKey,
  type DbWriteEntityRegistry,
  type DbWriteTableKey,
  dbEntityRegistry
} from '#backend/services/db/db-entity-registry';
import {
  DbTable,
  type DbTableContext,
  type DbTableExistsQuery,
  type DbTableQuery,
  type DbWriteTable
} from '#backend/services/db/db-table';

export type DbTableRegistry = {
  [Key in DbWriteTableKey]: Key extends DbReadTableKey
    ? DbTable<Key>
    : DbWriteTable<Key>;
};

export function createDbTableRegistry(item: {
  dbExtra: DbExtra;
  context: DbTableContext;
}): DbTableRegistry {
  let { dbExtra, context } = item;

  let readEntityRegistry: DbReadEntityRegistry = dbEntityRegistry;

  let writeEntityRegistry: DbWriteEntityRegistry = dbEntityRegistry;

  let queryMap: {
    [Key in DbReadTableKey as `${Key}Table`]: DbTableQuery<Key>;
  } = dbExtra.drizzle.query;

  let existsQueryMap: {
    [Key in DbReadTableKey as `${Key}Table`]: DbTableExistsQuery<Key>;
  } = dbExtra.drizzle.query;

  let keys: DbWriteTableKey[] = Object.keys(
    dbEntityRegistry
  ) as DbWriteTableKey[];

  let entries: [string, unknown][] = keys.map(
    <Key extends DbWriteTableKey>(key: Key): [string, unknown] => {
      let entityConfig: (typeof dbEntityRegistry)[Key] = dbEntityRegistry[key];

      if ('entToTab' in entityConfig) {
        // Key enumeration loses key/value correlation. Keep the assertions at
        // this construction boundary, after checking the read capability.
        let readKey: DbReadTableKey = key as DbReadTableKey;

        let query: DbTableQuery<DbReadTableKey> = queryMap[`${readKey}Table`];

        let table: DbTable<DbReadTableKey> = new DbTable({
          key: readKey,
          query: query,
          existsQuery: existsQueryMap[`${readKey}Table`],
          entityConfig: readEntityRegistry[readKey],
          context: context
        });

        return [key, table];
      }

      let writeTable: DbWriteTable<Key> = {
        tabToEnt: x =>
          writeEntityRegistry[key].tabToEnt({
            tab: x.tab,
            hashSecret: x.hashSecret,
            hashService: context.hashService,
            tabService: context.tabService,
            isEncryptDb: context.isEncryptDb,
            isEncryptMetadata: context.isEncryptMetadata
          })
      };

      return [key, writeTable];
    }
  );

  // Every entity config contributes exactly one wrapper, with read capabilities
  // only when its config provides them.
  let tableRegistry: DbTableRegistry = Object.fromEntries(
    entries
  ) as DbTableRegistry;

  return tableRegistry;
}
