import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { zDiskFileChange } from '#common/zod/disk/disk-file-change';
import { zDiskFileLine } from '#common/zod/disk/disk-file-line';

export let zDiskItemStatus = z
  .object({
    repoStatus: z.enum(RepoStatusEnum),
    conflicts: z.array(zDiskFileLine),
    currentBranch: z.string(),
    changesToCommit: z.array(zDiskFileChange),
    changesToPush: z.array(zDiskFileChange)
  })
  .meta({ id: 'DiskItemStatus' });

export type DiskItemStatus = z.infer<typeof zDiskItemStatus>;
