import { Result } from '@praha/byethrow';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type { DbTableRegistry } from '#backend/services/db/create-db-table-registry';
import type { DbTableConversion } from '#backend/services/db/db-table-conversion';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConvertTabsPackKeyError } from '#common/types/backend/function-errors/convert-tabs-pack-key-error';

export function convertTabsPackKey<Key extends keyof DbTabsPack>(item: {
  key: Key;
  tabsPack: DbTabsPack;
  hashSecret?: string;
  tableRegistry: DbTableRegistry;
}): Result.Result<DbTableConversion<Key>, ConvertTabsPackKeyError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabs', v =>
      Result.succeed((v.tabsPack[v.key] ?? []).filter(x => isDefined(x)))
    ),
    Result.bind('ents', v =>
      Result.sequence(v.tabs, tab =>
        v.tableRegistry[v.key].tabToEnt({
          tab: tab,
          hashSecret: v.hashSecret
        })
      )
    ),
    Result.map(
      (v): DbTableConversion<Key> => ({
        key: v.key,
        ents: v.ents
      })
    )
  );
}
