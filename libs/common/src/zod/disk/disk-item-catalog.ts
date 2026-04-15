import { z } from 'zod';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogNode } from '#common/zod/disk/disk-catalog-node';

export let zDiskItemCatalog = z
  .object({
    files: z.array(zDiskCatalogFile),
    nodes: z.array(zDiskCatalogNode),
    mproveDir: z.string()
  })
  .meta({ id: 'DiskItemCatalog' });

export type DiskItemCatalog = z.infer<typeof zDiskItemCatalog>;
