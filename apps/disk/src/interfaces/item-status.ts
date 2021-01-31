import { api } from '~/barrels/api';

export interface ItemStatus {
  repoStatus: api.RepoStatusEnum;

  conflicts: api.DiskFileLine[];

  currentBranch: string;
}
