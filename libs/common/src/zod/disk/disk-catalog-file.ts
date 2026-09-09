import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskCatalogFile = {
  projectId: string;
  repoId: string;
  fileId: string;
  pathString: string;
  fileNodeId: string;
  name: string;
  content: string;
};

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

assertTypesEqual<DiskCatalogFile, z.infer<typeof zDiskCatalogFile>>({
  value: true
});
