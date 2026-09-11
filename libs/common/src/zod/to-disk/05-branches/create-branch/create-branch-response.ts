import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskCreateBranchError,
  zToDiskCreateBranchError
} from './create-branch-error';

export type ToDiskCreateBranchOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskCreateBranchResponse = ToDiskResponse<
  'ToDiskCreateBranch',
  ToDiskCreateBranchOutput,
  ToDiskCreateBranchError
>;

export let zToDiskCreateBranchResponse = makeToDiskResponseSchema({
  path: 'ToDiskCreateBranch',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskCreateBranchOutput' }),
  error: zToDiskCreateBranchError
});

assertTypesEqual<
  ToDiskCreateBranchResponse,
  z.infer<typeof zToDiskCreateBranchResponse>
>({ value: true });
