import { z } from 'zod';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';

let zDiskCatalogNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().nullish(),
    isFolder: z.boolean().nullish(),
    name: z.string().nullish(),
    fileId: z.string().nullish(),
    children: z.array(zDiskCatalogNode).nullish()
  })
);

export let zStateRepo = z.object({
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
    .nullish(),
  nodes: z.array(zDiskCatalogNode).nullish()
});
