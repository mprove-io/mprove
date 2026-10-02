import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/types/disk/parts/disk-file-change';
import {
  type DiskFileLine,
  zDiskFileLine
} from '#common/types/disk/parts/disk-file-line';
import {
  type RepoError,
  zRepoError
} from '#common/types/disk/parts/repo-error';
import {
  type RepoStatus,
  zRepoStatus
} from '#common/types/disk/parts/repo-status';

export type DiskItemStatus = {
  repoStatus: RepoStatus;
  repoError?: RepoError;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
};

export let zDiskItemStatus = z
  .object({
    repoStatus: zRepoStatus,
    repoError: zRepoError.nullish(),
    conflicts: z.array(zDiskFileLine),
    currentBranch: z.string(),
    changesToCommit: z.array(zDiskFileChange),
    changesToPush: z.array(zDiskFileChange)
  })
  .meta({ id: 'DiskItemStatus' });

assertTypesEqual<DiskItemStatus, z.infer<typeof zDiskItemStatus>>({
  value: true
});
