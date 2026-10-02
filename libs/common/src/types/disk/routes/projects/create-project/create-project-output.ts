import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/disk-catalog-file';

export type ToDiskCreateProjectOutput = {
  orgId: string;
  projectId: string;
  defaultBranch: string;
  prodFiles: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateProjectOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    defaultBranch: z.string(),
    prodFiles: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateProjectOutput' });

assertTypesEqual<
  ToDiskCreateProjectOutput,
  z.infer<typeof zToDiskCreateProjectOutput>
>({ value: true });
