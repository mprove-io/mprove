import { z } from 'zod';
import { zRepoStatusEtype } from '#common/zod/disk/repo-status.etype';

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
    repoStatus: zRepoStatusEtype,
    conflicts: z.array(zValidateFilesRepoConflict)
  })
  .meta({ id: 'ValidateFilesRepo' });

export type ValidateFilesRepo = z.infer<typeof zValidateFilesRepo>;
