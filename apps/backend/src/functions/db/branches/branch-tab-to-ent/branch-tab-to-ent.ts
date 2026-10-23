import { Result } from '@praha/byethrow';
import type { BranchTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BranchLt } from '#common/types/shared/st-lt/branches/branch-lt';
import type { BranchSt } from '#common/types/shared/st-lt/branches/branch-st';

export function branchTabToEnt(item: {
  tab: BranchTab;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<BranchEnt, never> {
  let { tab, hashService, tabService, isEncryptDb, isEncryptMetadata } = item;

  let branchSt: BranchSt = {};

  let branchLt: BranchLt = {};

  let branchEnt: BranchEnt = {
    branchFullId: hashService.makeBranchFullId({
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId
    }),
    projectId: tab.projectId,
    repoId: tab.repoId,
    branchId: tab.branchId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: branchSt,
      dataLt: branchLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(branchEnt);
}
