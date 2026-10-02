import { z } from 'zod';
import { zValidateFilesRepoConflict } from '#common/types/backend/parts/state/validate-files-repo-conflict';
import { zDiskCatalogNode } from '#common/types/disk/parts/disk-catalog-node';
import { zRepoError } from '#common/types/disk/parts/repo-error';
import { zRepoStatus } from '#common/types/disk/parts/repo-status';

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
