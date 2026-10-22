import type { DbExtra } from '#backend/drizzle/drizzle.module';
import { dbEntityDefinition } from '#backend/services/db/db-entity-defs';
import {
  DbTable,
  type DbTableExistsQuery,
  type DbTableQuery
} from '#backend/services/db/db-table';
import type {
  DbConverterContext,
  DbReadDefinitionMap,
  DbReadTableKey,
  DbTableMap,
  DbWriteConverter,
  DbWriteDefinitionMap,
  DbWriteTableKey
} from '#backend/services/db/db-table-types';

export function createDbTables(item: {
  dbExtra: DbExtra;
  context: DbConverterContext;
}): DbTableMap {
  let { dbExtra, context } = item;

  let readDefinitionMap: DbReadDefinitionMap = dbEntityDefinition;

  let writeDefinitionMap: DbWriteDefinitionMap = dbEntityDefinition;

  let queryMap: {
    [Key in DbReadTableKey as `${Key}Table`]: DbTableQuery<Key>;
  } = dbExtra.drizzle.query;

  let existsQueryMap: {
    [Key in DbReadTableKey as `${Key}Table`]: DbTableExistsQuery<Key>;
  } = dbExtra.drizzle.query;

  let keys: DbWriteTableKey[] = Object.keys(
    dbEntityDefinition
  ) as DbWriteTableKey[];

  let entries: [string, unknown][] = keys.map(
    <Key extends DbWriteTableKey>(key: Key): [string, unknown] => {
      let definition: (typeof dbEntityDefinition)[Key] =
        dbEntityDefinition[key];

      if ('entToTab' in definition) {
        // Key enumeration loses key/value correlation. Keep the assertions at
        // this construction boundary, after checking the read capability.
        let readKey: DbReadTableKey = key as DbReadTableKey;

        let query: DbTableQuery<DbReadTableKey> = queryMap[`${readKey}Table`];

        let table: DbTable<DbReadTableKey> = new DbTable({
          key: readKey,
          query: query,
          existsQuery: existsQueryMap[`${readKey}Table`],
          definition: readDefinitionMap[readKey],
          context: context
        });

        return [key, table];
      }

      let converter: DbWriteConverter<Key> = {
        tabToEnt: x =>
          writeDefinitionMap[key].tabToEnt({
            tab: x.tab,
            hashSecret: x.hashSecret,
            hashService: context.hashService,
            tabService: context.tabService,
            isEncryptDb: context.isEncryptDb,
            isEncryptMetadata: context.isEncryptMetadata
          })
      };

      return [key, converter];
    }
  );

  // Every definition contributes exactly one wrapper, with read capabilities
  // only when its definition provides them.
  let tableMap: DbTableMap = Object.fromEntries(entries) as DbTableMap;

  return tableMap;
}
