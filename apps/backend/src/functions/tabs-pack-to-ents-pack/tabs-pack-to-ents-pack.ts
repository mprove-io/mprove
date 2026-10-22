import { Result } from '@praha/byethrow';
import {
  type ConvertTabsPackKeyOutput,
  convertTabsPackKey
} from '#backend/functions/tabs-pack-to-ents-pack/convert-tabs-pack-key/convert-tabs-pack-key';
import type { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type { DbWriteTableRegistry } from '#backend/services/db/db-table';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { TabsPackToEntsPackError } from '#common/types/backend/function-errors/tabs-pack-to-ents-pack-error';

export const tabsPackKeys = [
  'avatars',
  'branches',
  'bridges',
  'cachedColumns',
  'cachedParts',
  'charts',
  'connections',
  'dashboards',
  'dconfigs',
  'envs',
  'givens',
  'roles',
  'kits',
  'mconfigs',
  'members',
  'ocMessages',
  'modelFieldLeafs',
  'models',
  'notes',
  'ocSessions',
  'orgs',
  'ocParts',
  'projects',
  'providers',
  'queries',
  'reports',
  'structs',
  'users',
  'ocEvents',
  'sessions',
  'uconfigs'
] as const;

assertTypesEqual<(typeof tabsPackKeys)[number], keyof DbTabsPack>({
  value: true
});

export function tabsPackToEntsPack(item: {
  tabsPack: DbTabsPack;
  hashSecret?: string;
  tableRegistry: DbWriteTableRegistry;
}): Result.Result<DbEntsPack, TabsPackToEntsPackError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('keyOutputs', v =>
      Result.sequence(tabsPackKeys, key =>
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
