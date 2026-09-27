import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteBranchError,
  zToDiskDeleteBranchError
} from './delete-branch-error';
import {
  type ToDiskDeleteBranchOutput,
  zToDiskDeleteBranchOutput
} from './delete-branch-output';

export type ToDiskDeleteBranchResponse = ToDiskResponseBase<
  'deleteBranch',
  ToDiskDeleteBranchOutput,
  ToDiskDeleteBranchError
>;

export let zToDiskDeleteBranchResponse = makeToDiskResponseSchema({
  operation: 'deleteBranch',
  output: zToDiskDeleteBranchOutput,
  error: zToDiskDeleteBranchError
});

assertTypesEqual<
  ToDiskDeleteBranchResponse,
  z.infer<typeof zToDiskDeleteBranchResponse>
>({ value: true });
