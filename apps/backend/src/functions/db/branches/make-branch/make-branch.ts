import type { BranchTab } from '#backend/drizzle/postgres/tables/branches';
import { makeBranchFullId } from '#backend/functions/db/branches/make-branch-full-id/make-branch-full-id';

export function makeBranch(item: {
  projectId: string;
  repoId: string;
  branchId: string;
}): BranchTab {
  let { projectId, repoId, branchId } = item;

  let branch: BranchTab = {
    branchFullId: makeBranchFullId({
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
