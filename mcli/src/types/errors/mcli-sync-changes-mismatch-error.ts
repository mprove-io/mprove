import type { DiskFileChange } from '#common/types/disk/parts/file/disk-file-change';

export type McliSyncChangesMismatchError = {
  code: 'MCLI_SYNC_CHANGES_MISMATCH';
  displayData: {
    localChangesToCommit: DiskFileChange[];
    devChangesToCommit: DiskFileChange[];
  };
};
