import { Result } from '@praha/byethrow';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BridgeLt } from '#common/types/shared/st-lt/bridges/bridge-lt';
import type { BridgeSt } from '#common/types/shared/st-lt/bridges/bridge-st';

export function bridgeTabToEnt(item: {
  tab: BridgeTab;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<BridgeEnt, never> {
  let { tab, hashService, tabService, isEncryptDb, isEncryptMetadata } = item;

  let bridgeSt: BridgeSt = {};
  let bridgeLt: BridgeLt = {};

  let bridgeEnt: BridgeEnt = {
    bridgeFullId: hashService.makeBridgeFullId({
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId,
      envId: tab.envId
    }),
    projectId: tab.projectId,
    repoId: tab.repoId,
    branchId: tab.branchId,
    envId: tab.envId,
    structId: tab.structId,
    needValidate: tab.needValidate,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: bridgeSt,
      dataLt: bridgeLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(bridgeEnt);
}
