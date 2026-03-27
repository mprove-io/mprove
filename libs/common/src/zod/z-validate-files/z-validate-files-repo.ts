import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';

export let zValidateFilesRepo = z.object({
  orgId: z.string().nullish(),
  projectId: z.string().nullish(),
  repoId: z.string().nullish(),
  currentBranchId: z.string().nullish(),
  repoStatus: z.enum(RepoStatusEnum).nullish(),
  conflicts: z
    .array(
      z.object({
        fileId: z.string().nullish(),
        fileName: z.string().nullish(),
        lineNumber: z.number().nullish()
      })
    )
    .nullish()
});
