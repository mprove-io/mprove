import { z } from 'zod';

export let zDiskCatalogNode: z.ZodType<{
  id: string;
  isFolder: boolean;
  name: string;
  fileId: string;
  children: unknown[];
}> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      isFolder: z.boolean(),
      name: z.string(),
      fileId: z.string(),
      children: z.array(zDiskCatalogNode)
    })
    .meta({ id: 'DiskCatalogNode' })
);

export type ZDiskCatalogNode = z.infer<typeof zDiskCatalogNode>;
