import { z } from 'zod';
import { zRepoStatus } from '#common/zod/disk/repo-status';

export let zValidateFilesRepoConflict = z
  .object({
    fileId: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'ValidateFilesRepoConflict' });

export type ValidateFilesRepoConflict = z.infer<
  typeof zValidateFilesRepoConflict
>;

export let zValidateFilesRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatus,
    conflicts: z.array(zValidateFilesRepoConflict)
  })
  .meta({ id: 'ValidateFilesRepo' });

export type ValidateFilesRepo = z.infer<typeof zValidateFilesRepo>;
