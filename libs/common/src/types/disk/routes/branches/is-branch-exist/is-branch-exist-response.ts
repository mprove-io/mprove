import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskIsBranchExistError,
  zToDiskIsBranchExistError
} from './is-branch-exist-error';
import {
  type ToDiskIsBranchExistOutput,
  zToDiskIsBranchExistOutput
} from './is-branch-exist-output';

export type ToDiskIsBranchExistResponse = ToDiskResponseBase<
  'isBranchExist',
  ToDiskIsBranchExistOutput,
  ToDiskIsBranchExistError
>;

export let zToDiskIsBranchExistResponse = makeToDiskResponseSchema({
  operation: 'isBranchExist',
  output: zToDiskIsBranchExistOutput,
  error: zToDiskIsBranchExistError
});

assertTypesEqual<
  ToDiskIsBranchExistResponse,
  z.infer<typeof zToDiskIsBranchExistResponse>
>({ value: true });
