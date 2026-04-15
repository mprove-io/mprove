import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { DiskFileChange } from '#common/interfaces/disk/disk-file-change';
import { DiskFileLine } from '#common/interfaces/disk/disk-file-line';

export interface DiskItemStatus {
  repoStatus: RepoStatusEnum;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
}
