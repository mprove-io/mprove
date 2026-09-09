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
import {
  type RepoErrorEtype,
  zRepoErrorEtype
} from '#common/zod/disk/repo-error.etype';
import {
  type RepoStatusEtype,
  zRepoStatusEtype
} from '#common/zod/disk/repo-status.etype';

export type DiskItemStatus = {
  repoStatus: RepoStatusEtype;
  repoError?: RepoErrorEtype;
  conflicts: DiskFileLine[];
  currentBranch: string;
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
};

export let zDiskItemStatus = z
  .object({
    repoStatus: zRepoStatusEtype,
    repoError: zRepoErrorEtype.nullish(),
    conflicts: z.array(zDiskFileLine),
    currentBranch: z.string(),
    changesToCommit: z.array(zDiskFileChange),
    changesToPush: z.array(zDiskFileChange)
  })
  .meta({ id: 'DiskItemStatus' });

assertTypesEqual<DiskItemStatus, z.infer<typeof zDiskItemStatus>>({
  value: true
});
