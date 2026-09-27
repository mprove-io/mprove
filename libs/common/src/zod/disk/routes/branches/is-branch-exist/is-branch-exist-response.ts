import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskIsBranchExistError,
  zToDiskIsBranchExistError
} from './is-branch-exist-error';

export type ToDiskIsBranchExistResponse = ToDiskResponseBase<
  'isBranchExist',
  ToDiskIsBranchExistOutput,
  ToDiskIsBranchExistError
>;

export type ToDiskIsBranchExistOutput = {
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  isRemote: boolean;
  isBranchExist: boolean;
};

export let zToDiskIsBranchExistOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean(),
    isBranchExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistOutput' });

export let zToDiskIsBranchExistResponse = makeToDiskResponseSchema({
  operation: 'isBranchExist',
  output: zToDiskIsBranchExistOutput,
  error: zToDiskIsBranchExistError
});

assertTypesEqual<
  ToDiskIsBranchExistOutput,
  z.infer<typeof zToDiskIsBranchExistOutput>
>({ value: true });

assertTypesEqual<
  ToDiskIsBranchExistResponse,
  z.infer<typeof zToDiskIsBranchExistResponse>
>({ value: true });
