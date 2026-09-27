import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendRevertRepoToRemoteError,
  zToBackendRevertRepoToRemoteError
} from './revert-repo-to-remote-error';

export type ToBackendRevertRepoToRemoteOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendRevertRepoToRemoteResponse = ToBackendResponse<
  ToBackendRevertRepoToRemoteOutput,
  ToBackendRevertRepoToRemoteError
>;

export let zToBackendRevertRepoToRemoteOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteOutput' });

export let zToBackendRevertRepoToRemoteResponse = makeToBackendResponseSchema({
  success: zToBackendRevertRepoToRemoteOutput,
  error: zToBackendRevertRepoToRemoteError
}).meta({ id: 'ToBackendRevertRepoToRemoteResponse' });

assertTypesEqual<
  ToBackendRevertRepoToRemoteOutput,
  z.infer<typeof zToBackendRevertRepoToRemoteOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRevertRepoToRemoteResponse,
  z.infer<typeof zToBackendRevertRepoToRemoteResponse>
>({ value: true });
