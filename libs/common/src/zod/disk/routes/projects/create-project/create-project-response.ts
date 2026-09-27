import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCreateProjectError,
  zToDiskCreateProjectError
} from './create-project-error';

export type ToDiskCreateProjectResponse = ToDiskResponseBase<
  'createProject',
  ToDiskCreateProjectOutput,
  ToDiskCreateProjectError
>;

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

export let zToDiskCreateProjectResponse = makeToDiskResponseSchema({
  operation: 'createProject',
  output: zToDiskCreateProjectOutput,
  error: zToDiskCreateProjectError
});

assertTypesEqual<
  ToDiskCreateProjectOutput,
  z.infer<typeof zToDiskCreateProjectOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCreateProjectResponse,
  z.infer<typeof zToDiskCreateProjectResponse>
>({ value: true });
