import { z } from 'zod';
import { zValidateFilesRepoConflict } from '#common/zod/backend/state/validate-files-repo';
import { zDiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import { zRepoError } from '#common/zod/disk/repo-error';
import { zRepoStatus } from '#common/zod/disk/repo-status';

export let zStateRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatus,
    repoError: zRepoError.nullish(),
    conflicts: z.array(zValidateFilesRepoConflict),
    nodes: z.array(zDiskCatalogNode)
  })
  .meta({ id: 'StateRepo' });

export type StateRepo = z.infer<typeof zStateRepo>;
