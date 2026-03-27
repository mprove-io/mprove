import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';

export let zValidateFilesRepo = z.object({
  orgId: z.string(),
  projectId: z.string(),
  repoId: z.string(),
  currentBranchId: z.string(),
  repoStatus: z.enum(RepoStatusEnum),
  conflicts: z.array(
    z.object({
      fileId: z.string(),
      fileName: z.string(),
      lineNumber: z.number()
    })
  )
});
