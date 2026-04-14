import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';

export let zValidateFilesRepoConflict = z
  .object({
    fileId: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'ValidateFilesRepoConflict' });

export type ZValidateFilesRepoConflict = z.infer<
  typeof zValidateFilesRepoConflict
>;

export let zValidateFilesRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: z.enum(RepoStatusEnum),
    conflicts: z.array(zValidateFilesRepoConflict)
  })
  .meta({ id: 'ValidateFilesRepo' });

export type ZValidateFilesRepo = z.infer<typeof zValidateFilesRepo>;
