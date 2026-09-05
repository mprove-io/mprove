import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';

export type ToDiskCreateProjectResponsePayload = {
  orgId: string;
  projectId: string;
  defaultBranch: string;
  prodFiles: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateProjectResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    defaultBranch: z.string(),
    prodFiles: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateProjectResponsePayload' });

assertTypesEqual<
  ToDiskCreateProjectResponsePayload,
  z.infer<typeof zToDiskCreateProjectResponsePayload>
>({ value: true });
