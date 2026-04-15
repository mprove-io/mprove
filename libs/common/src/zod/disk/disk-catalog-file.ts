import { z } from 'zod';

export let zDiskCatalogFile = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    fileId: z.string(),
    pathString: z.string(),
    fileNodeId: z.string(),
    name: z.string(),
    content: z.string()
  })
  .meta({ id: 'DiskCatalogFile' });

export type DiskCatalogFile = z.infer<typeof zDiskCatalogFile>;
