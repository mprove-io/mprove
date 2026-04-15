import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { zDiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import { zDiskFileChange } from '#common/zod/disk/disk-file-change';
import { zDiskFileLine } from '#common/zod/disk/disk-file-line';

export let zRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: z.enum(RepoStatusEnum),
    conflicts: z.array(zDiskFileLine),
    nodes: z.array(zDiskCatalogNode),
    changesToCommit: z.array(zDiskFileChange),
    changesToPush: z.array(zDiskFileChange)
  })
  .meta({ id: 'Repo' });

export type Repo = z.infer<typeof zRepo>;
