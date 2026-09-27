import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteBranchError,
  zToDiskDeleteBranchError
} from './delete-branch-error';

export type ToDiskDeleteBranchResponse = ToDiskResponseBase<
  'deleteBranch',
  ToDiskDeleteBranchOutput,
  ToDiskDeleteBranchError
>;

export type ToDiskDeleteBranchOutput = {
  repo: Repo;
  deletedBranch: string;
};

export let zToDiskDeleteBranchOutput = z
  .object({ repo: zRepo, deletedBranch: z.string() })
  .meta({ id: 'ToDiskDeleteBranchOutput' });

export let zToDiskDeleteBranchResponse = makeToDiskResponseSchema({
  operation: 'deleteBranch',
  output: zToDiskDeleteBranchOutput,
  error: zToDiskDeleteBranchError
});

assertTypesEqual<
  ToDiskDeleteBranchOutput,
  z.infer<typeof zToDiskDeleteBranchOutput>
>({ value: true });

assertTypesEqual<
  ToDiskDeleteBranchResponse,
  z.infer<typeof zToDiskDeleteBranchResponse>
>({ value: true });
