import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeBridgeFullId } from '#backend/functions/hash/make-bridge-full-id/make-bridge-full-id';

export function makeBridge(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  structId: string;
  needValidate: boolean;
}): BridgeTab {
  let { projectId, repoId, branchId, envId, structId, needValidate } = item;

  let bridge: BridgeTab = {
    bridgeFullId: makeBridgeFullId({
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
