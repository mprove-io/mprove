import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskPilotResponseSchema,
  type ToDiskPilotResponse
} from '#common/zod/to-disk/to-disk-pilot-response';
import {
  type ToDiskDeleteBranchError,
  zToDiskDeleteBranchError
} from './delete-branch-error';

export type ToDiskDeleteBranchResponse = ToDiskPilotResponse<
  'ToDiskDeleteBranch',
  { repo: Repo; deletedBranch: string },
  ToDiskDeleteBranchError
>;

export let zToDiskDeleteBranchResponse = makeToDiskPilotResponseSchema({
  path: 'ToDiskDeleteBranch',
  success: z
    .object({ repo: zRepo, deletedBranch: z.string() })
    .meta({ id: 'ToDiskDeleteBranchResponsePayload' }),
  error: zToDiskDeleteBranchError
});

assertTypesEqual<
  ToDiskDeleteBranchResponse,
  z.infer<typeof zToDiskDeleteBranchResponse>
>({ value: true });
