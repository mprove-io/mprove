import { apiToDisk } from '~disk/barrels/api';
import { common } from '~disk/barrels/common';

export interface ItemStatus {
  repoStatus: apiToDisk.RepoStatusEnum;

  conflicts: common.DiskFileLine[];

  currentBranch: string;
}
