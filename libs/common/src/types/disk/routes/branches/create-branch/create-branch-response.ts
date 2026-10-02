import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCreateBranchError,
  zToDiskCreateBranchError
} from './create-branch-error';
import {
  type ToDiskCreateBranchOutput,
  zToDiskCreateBranchOutput
} from './create-branch-output';

export type ToDiskCreateBranchResponse = ToDiskResponseBase<
  'createBranch',
  ToDiskCreateBranchOutput,
  ToDiskCreateBranchError
>;

export let zToDiskCreateBranchResponse = makeToDiskResponseSchema({
  operation: 'createBranch',
  output: zToDiskCreateBranchOutput,
  error: zToDiskCreateBranchError
});

assertTypesEqual<
  ToDiskCreateBranchResponse,
  z.infer<typeof zToDiskCreateBranchResponse>
>({ value: true });
