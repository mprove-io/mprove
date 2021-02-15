import { common } from '~disk/barrels/common';

export interface ItemStatus {
  repoStatus: common.RepoStatusEnum;

  conflicts: common.DiskFileLine[];

  currentBranch: string;
}
