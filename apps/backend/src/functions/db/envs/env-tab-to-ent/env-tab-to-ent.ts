import { Result } from '@praha/byethrow';
import type { EnvEnt, EnvTab } from '#backend/drizzle/postgres/tables/envs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeEnvFullId } from '#backend/functions/hash/make-env-full-id/make-env-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { EnvLt } from '#common/types/shared/st-lt/envs/env-lt';
import type { EnvSt } from '#common/types/shared/st-lt/envs/env-st';

export function envTabToEnt(item: {
  tab: EnvTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<EnvEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let envSt: EnvSt = { evs: tab.evs };

  let envLt: EnvLt = {};

  let envEnt: EnvEnt = {
    envFullId: makeEnvFullId({
      projectId: tab.projectId,
      envId: tab.envId
    }),
    projectId: tab.projectId,
    envId: tab.envId,
    memberIds: tab.memberIds,
    isFallbackToProdConnections: tab.isFallbackToProdConnections,
    isFallbackToProdVariables: tab.isFallbackToProdVariables,
    useProdCache: tab.useProdCache,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: envSt,
      dataLt: envLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(envEnt);
}
