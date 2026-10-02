import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendRevertRepoToRemoteOutput,
  zToBackendRevertRepoToRemoteOutput
} from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-output';
import {
  type ToBackendRevertRepoToRemoteError,
  zToBackendRevertRepoToRemoteError
} from './revert-repo-to-remote-error';

export type ToBackendRevertRepoToRemoteResponse = ToBackendResponseBase<
  'revertRepoToRemote',
  ToBackendRevertRepoToRemoteOutput,
  ToBackendRevertRepoToRemoteError
>;

export let zToBackendRevertRepoToRemoteResponse = makeToBackendResponseSchema({
  operation: 'revertRepoToRemote',
  output: zToBackendRevertRepoToRemoteOutput,
  error: zToBackendRevertRepoToRemoteError
}).meta({ id: 'ToBackendRevertRepoToRemoteResponse' });

assertTypesEqual<
  ToBackendRevertRepoToRemoteResponse,
  z.infer<typeof zToBackendRevertRepoToRemoteResponse>
>({ value: true });
