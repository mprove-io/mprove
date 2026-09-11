import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskDeleteBranchError,
  zToDiskDeleteBranchError
} from './delete-branch-error';

export type ToDiskDeleteBranchOutput = {
  repo: Repo;
  deletedBranch: string;
};

export type ToDiskDeleteBranchResponse = ToDiskResponse<
  'ToDiskDeleteBranch',
  ToDiskDeleteBranchOutput,
  ToDiskDeleteBranchError
>;

export let zToDiskDeleteBranchResponse = makeToDiskResponseSchema({
  path: 'ToDiskDeleteBranch',
  success: z
    .object({ repo: zRepo, deletedBranch: z.string() })
    .meta({ id: 'ToDiskDeleteBranchOutput' }),
  error: zToDiskDeleteBranchError
});

assertTypesEqual<
  ToDiskDeleteBranchResponse,
  z.infer<typeof zToDiskDeleteBranchResponse>
>({ value: true });
