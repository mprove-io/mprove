import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskCatalogNode = {
  id: string;
  isFolder: boolean;
  name: string;
  fileId?: string;
  children?: DiskCatalogNode[];
};

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

assertTypesEqual<DiskCatalogNode, z.infer<typeof zDiskCatalogNode>>({
  value: true
});
