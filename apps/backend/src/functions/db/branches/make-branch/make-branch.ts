import type { BranchTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { HashService } from '#backend/services/hash/hash.service';

export function makeBranch(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  hashService: HashService;
}): BranchTab {
  let { projectId, repoId, branchId, hashService } = item;

  let branch: BranchTab = {
    branchFullId: hashService.makeBranchFullId({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    }),
    projectId: projectId,
    repoId: repoId,
    branchId: branchId,
    keyTag: undefined,
    serverTs: undefined
  };

  return branch;
}
