import { api } from '~disk/barrels/api';

export interface ItemStatus {
  repoStatus: api.RepoStatusEnum;

  conflicts: api.DiskFileLine[];

  currentBranch: string;
}
