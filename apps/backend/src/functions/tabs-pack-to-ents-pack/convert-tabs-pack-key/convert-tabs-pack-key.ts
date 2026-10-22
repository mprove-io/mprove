import { Result } from '@praha/byethrow';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type {
  DbTableEnt,
  DbTableTab
} from '#backend/services/db/db-entity-registry';
import type { DbWriteTableRegistry } from '#backend/services/db/db-table';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConvertTabsPackKeyError } from '#common/types/backend/function-errors/convert-tabs-pack-key-error';

export type ConvertTabsPackKeyOutput<
  Key extends keyof DbTabsPack = keyof DbTabsPack
> = {
  key: Key;
  ents: DbTableEnt<Key>[];
};

export function convertTabsPackKey<Key extends keyof DbTabsPack>(item: {
  key: Key;
  tabsPack: DbTabsPack;
  hashSecret?: string;
  tableRegistry: DbWriteTableRegistry;
}): Result.Result<ConvertTabsPackKeyOutput<Key>, ConvertTabsPackKeyError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabs', v => {
      let tabsByKey: { [K in keyof DbTabsPack]?: DbTableTab<K>[] } = v.tabsPack;

      let tabs: DbTableTab<Key>[] = (tabsByKey[v.key] ?? []).filter(x =>
        isDefined(x)
      );

      return Result.succeed(tabs);
    }),
    Result.bind('ents', v =>
      Result.sequence(v.tabs, tab =>
        v.tableRegistry[v.key].tabToEnt({
          tab: tab,
          hashSecret: v.hashSecret
        })
      )
    ),
    Result.map(
      (v): ConvertTabsPackKeyOutput<Key> => ({
        key: v.key,
        ents: v.ents
      })
    )
  );
}
