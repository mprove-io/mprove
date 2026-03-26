import { z } from 'zod';

let zDiskCatalogNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    isFolder: z.boolean(),
    name: z.string(),
    fileId: z.string().optional(),
    children: z.array(zDiskCatalogNode).optional()
  })
);

export let zStateRepo = z.object({
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
  ),
  nodes: z.array(zDiskCatalogNode).optional()
});
