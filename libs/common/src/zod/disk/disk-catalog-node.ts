import { z } from 'zod';

export type ZDiskCatalogNode = {
  id: string;
  isFolder: boolean;
  name: string;
  fileId: string;
  children: ZDiskCatalogNode[];
};

export let zDiskCatalogNode: z.ZodType<ZDiskCatalogNode> = z.lazy(() =>
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
