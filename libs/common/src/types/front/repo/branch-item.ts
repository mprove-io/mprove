import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export type BranchItem = {
  repoId: string;
  repoType: RepoType;
  branchId: string;
  extraId: string;
  extraName: string;
};
