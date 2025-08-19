import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { DiskFileLine } from '~common/interfaces/disk/disk-file-line';

export interface DiskItemStatus {
  repoStatus: RepoStatusEnum;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: any;
  changesToPush: any;
}
