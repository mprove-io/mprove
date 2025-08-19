import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { DiskFileLine } from '~common/interfaces/disk/disk-file-line';

export interface ItemStatus {
  repoStatus: RepoStatusEnum;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: any;
  changesToPush: any;
}
