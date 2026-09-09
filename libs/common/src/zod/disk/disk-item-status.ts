import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/zod/disk/disk-file-change';
import {
  type DiskFileLine,
  zDiskFileLine
} from '#common/zod/disk/disk-file-line';
import { type RepoError, zRepoError } from '#common/zod/disk/repo-error';
import { type RepoStatus, zRepoStatus } from '#common/zod/disk/repo-status';

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
