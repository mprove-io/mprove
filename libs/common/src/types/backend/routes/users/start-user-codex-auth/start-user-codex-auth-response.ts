import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendStartUserCodexAuthOutput,
  zToBackendStartUserCodexAuthOutput
} from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-output';
import {
  type ToBackendStartUserCodexAuthError,
  zToBackendStartUserCodexAuthError
} from './start-user-codex-auth-error';

export type ToBackendStartUserCodexAuthResponse = ToBackendResponseBase<
  'startUserCodexAuth',
  ToBackendStartUserCodexAuthOutput,
  ToBackendStartUserCodexAuthError
>;

export let zToBackendStartUserCodexAuthResponse = makeToBackendResponseSchema({
  operation: 'startUserCodexAuth',
  output: zToBackendStartUserCodexAuthOutput,
  error: zToBackendStartUserCodexAuthError
}).meta({ id: 'ToBackendStartUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendStartUserCodexAuthResponse,
  z.infer<typeof zToBackendStartUserCodexAuthResponse>
>({ value: true });
