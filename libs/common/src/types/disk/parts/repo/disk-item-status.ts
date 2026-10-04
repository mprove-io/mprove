import type { DiskFileChange } from '#common/types/disk/parts/file/disk-file-change';
import type { DiskFileLine } from '#common/types/disk/parts/file/disk-file-line';
import type { RepoError } from '#common/types/disk/parts/repo/repo-error';
import type { RepoStatus } from '#common/types/disk/parts/repo/repo-status';

export type DiskItemStatus = {
  repoStatus: RepoStatus;
  repoError?: RepoError;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
};
