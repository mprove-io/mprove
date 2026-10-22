import { Result } from '@praha/byethrow';
import type { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import { dbTableKeys } from '#backend/services/db/db-entity-registry';
import type { DbWriteTableRegistry } from '#backend/services/db/db-table';
import {
  type ConvertTabsPackKeyOutput,
  convertTabsPackKey
} from '#backend/services/db/tx-write/tabs-pack-to-ents-pack/convert-tabs-pack-key/convert-tabs-pack-key';
import type { TabsPackToEntsPackError } from '#common/types/backend/function-errors/tabs-pack-to-ents-pack-error';

export function tabsPackToEntsPack(item: {
  tabsPack: DbTabsPack;
  hashSecret?: string;
  tableRegistry: DbWriteTableRegistry;
}): Result.Result<DbEntsPack, TabsPackToEntsPackError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('keyOutputs', v =>
      Result.sequence(dbTableKeys, key =>
        convertTabsPackKey({
          key: key,
          tabsPack: v.tabsPack,
          hashSecret: v.hashSecret,
          tableRegistry: v.tableRegistry
        })
      )
    ),
    Result.map(
      (v): DbEntsPack =>
        Object.fromEntries(
          v.keyOutputs.map((x: ConvertTabsPackKeyOutput) => [x.key, x.ents])
        )
    )
  );
}
