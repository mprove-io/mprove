import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskIsBranchExistError,
  zToDiskIsBranchExistError
} from './is-branch-exist-error';

export type ToDiskIsBranchExistOutput = {
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  isRemote: boolean;
  isBranchExist: boolean;
};

export type ToDiskIsBranchExistResponse = ToDiskResponse<
  'isBranchExist',
  ToDiskIsBranchExistOutput,
  ToDiskIsBranchExistError
>;

export let zToDiskIsBranchExistResponse = makeToDiskResponseSchema({
  operation: 'isBranchExist',
  success: z
    .object({
      orgId: z.string(),
      projectId: z.string(),
      repoId: z.string(),
      branch: z.string(),
      isRemote: z.boolean(),
      isBranchExist: z.boolean()
    })
    .meta({ id: 'ToDiskIsBranchExistOutput' }),
  error: zToDiskIsBranchExistError
});

assertTypesEqual<
  ToDiskIsBranchExistResponse,
  z.infer<typeof zToDiskIsBranchExistResponse>
>({ value: true });
