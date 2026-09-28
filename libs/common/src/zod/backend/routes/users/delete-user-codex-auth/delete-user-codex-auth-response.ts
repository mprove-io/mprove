import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteUserCodexAuthOutput,
  zToBackendDeleteUserCodexAuthOutput
} from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-output';
import {
  type ToBackendDeleteUserCodexAuthError,
  zToBackendDeleteUserCodexAuthError
} from './delete-user-codex-auth-error';

export type ToBackendDeleteUserCodexAuthResponse = ToBackendResponseBase<
  'deleteUserCodexAuth',
  ToBackendDeleteUserCodexAuthOutput,
  ToBackendDeleteUserCodexAuthError
>;

export let zToBackendDeleteUserCodexAuthResponse = makeToBackendResponseSchema({
  operation: 'deleteUserCodexAuth',
  output: zToBackendDeleteUserCodexAuthOutput,
  error: zToBackendDeleteUserCodexAuthError
}).meta({ id: 'ToBackendDeleteUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthResponse,
  z.infer<typeof zToBackendDeleteUserCodexAuthResponse>
>({ value: true });
