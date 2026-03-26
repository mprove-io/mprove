import { z } from 'zod';

export let zValidateFilesRepo = z.object({
  orgId: z.string(),
  projectId: z.string(),
  repoId: z.string(),
  currentBranchId: z.string(),
  repoStatus: z.string(),
  conflicts: z.array(
    z.object({
      fileId: z.string(),
      fileName: z.string(),
      lineNumber: z.number()
    })
  )
});
