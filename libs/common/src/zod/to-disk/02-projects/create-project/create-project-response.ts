import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskCreateProjectError,
  zToDiskCreateProjectError
} from './create-project-error';

export type ToDiskCreateProjectOutput = {
  orgId: string;
  projectId: string;
  defaultBranch: string;
  prodFiles: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskCreateProjectResponse = ToDiskResponse<
  'createProject',
  ToDiskCreateProjectOutput,
  ToDiskCreateProjectError
>;

export let zToDiskCreateProjectResponse = makeToDiskResponseSchema({
  operation: 'createProject',
  success: z
    .object({
      orgId: z.string(),
      projectId: z.string(),
      defaultBranch: z.string(),
      prodFiles: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskCreateProjectOutput' }),
  error: zToDiskCreateProjectError
});

assertTypesEqual<
  ToDiskCreateProjectResponse,
  z.infer<typeof zToDiskCreateProjectResponse>
>({ value: true });
