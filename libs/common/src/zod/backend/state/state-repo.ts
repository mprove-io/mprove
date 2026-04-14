import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { zValidateFilesRepoConflict } from '#common/zod/backend/state/validate-files-repo';
import { zDiskCatalogNode } from '#common/zod/disk/disk-catalog-node';

export let zStateRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: z.enum(RepoStatusEnum),
    conflicts: z.array(zValidateFilesRepoConflict),
    nodes: z.array(zDiskCatalogNode)
  })
  .meta({ id: 'StateRepo' });

export type ZStateRepo = z.infer<typeof zStateRepo>;
