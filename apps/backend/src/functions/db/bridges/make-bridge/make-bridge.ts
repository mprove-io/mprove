import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { HashService } from '#backend/services/hash/hash.service';

export function makeBridge(item: {
  hashService: HashService;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  structId: string;
  needValidate: boolean;
}): BridgeTab {
  let {
    hashService,
    projectId,
    repoId,
    branchId,
    envId,
    structId,
    needValidate
  } = item;

  let bridge: BridgeTab = {
    bridgeFullId: hashService.makeBridgeFullId({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId
    }),
    projectId: projectId,
    repoId: repoId,
    branchId: branchId,
    envId: envId,
    structId: structId,
    needValidate: needValidate,
    keyTag: undefined,
    serverTs: undefined
  };

  return bridge;
}
