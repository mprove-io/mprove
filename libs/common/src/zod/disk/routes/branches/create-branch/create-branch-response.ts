import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCreateBranchError,
  zToDiskCreateBranchError
} from './create-branch-error';

export type ToDiskCreateBranchResponse = ToDiskResponseBase<
  'createBranch',
  ToDiskCreateBranchOutput,
  ToDiskCreateBranchError
>;

export type ToDiskCreateBranchOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateBranchOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateBranchOutput' });

export let zToDiskCreateBranchResponse = makeToDiskResponseSchema({
  operation: 'createBranch',
  output: zToDiskCreateBranchOutput,
  error: zToDiskCreateBranchError
});

assertTypesEqual<
  ToDiskCreateBranchOutput,
  z.infer<typeof zToDiskCreateBranchOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCreateBranchResponse,
  z.infer<typeof zToDiskCreateBranchResponse>
>({ value: true });
