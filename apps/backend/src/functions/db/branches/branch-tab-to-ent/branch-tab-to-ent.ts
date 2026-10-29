import { Result } from '@praha/byethrow';
import type {
  BranchEnt,
  BranchTab
} from '#backend/drizzle/postgres/tables/branches';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeBranchFullId } from '#backend/functions/hash/make-branch-full-id/make-branch-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BranchLt } from '#common/types/shared/st-lt/branches/branch-lt';
import type { BranchSt } from '#common/types/shared/st-lt/branches/branch-st';

export function branchTabToEnt(item: {
  tab: BranchTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<BranchEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let branchSt: BranchSt = {};

  let branchLt: BranchLt = {};

  let branchEnt: BranchEnt = {
    branchFullId: makeBranchFullId({
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
