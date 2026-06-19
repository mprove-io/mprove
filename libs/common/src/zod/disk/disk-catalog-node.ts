import { z } from 'zod';

export let zDiskCatalogNode = z
  .object({
    id: z.string(),
    isFolder: z.boolean(),
    name: z.string(),
    fileId: z.string().nullish(),
    get children() {
      return z.array(zDiskCatalogNode).nullish();
    }
  })
  .meta({ id: 'DiskCatalogNode' });

export type DiskCatalogNode = z.infer<typeof zDiskCatalogNode>;
