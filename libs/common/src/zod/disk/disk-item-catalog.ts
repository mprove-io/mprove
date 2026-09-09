import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import {
  type DiskCatalogNode,
  zDiskCatalogNode
} from '#common/zod/disk/disk-catalog-node';

export type DiskItemCatalog = {
  files: DiskCatalogFile[];
  nodes: DiskCatalogNode[];
  mproveDir: string;
};

export let zDiskItemCatalog = z
  .object({
    files: z.array(zDiskCatalogFile),
    nodes: z.array(zDiskCatalogNode),
    mproveDir: z.string()
  })
  .meta({ id: 'DiskItemCatalog' });

assertTypesEqual<DiskItemCatalog, z.infer<typeof zDiskItemCatalog>>({
  value: true
});
