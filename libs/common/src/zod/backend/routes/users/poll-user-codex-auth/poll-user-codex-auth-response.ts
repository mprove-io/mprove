import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendPollUserCodexAuthOutput,
  zToBackendPollUserCodexAuthOutput
} from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-output';
import {
  type ToBackendPollUserCodexAuthError,
  zToBackendPollUserCodexAuthError
} from './poll-user-codex-auth-error';

export type ToBackendPollUserCodexAuthResponse = ToBackendResponseBase<
  'pollUserCodexAuth',
  ToBackendPollUserCodexAuthOutput,
  ToBackendPollUserCodexAuthError
>;

export let zToBackendPollUserCodexAuthResponse = makeToBackendResponseSchema({
  operation: 'pollUserCodexAuth',
  output: zToBackendPollUserCodexAuthOutput,
  error: zToBackendPollUserCodexAuthError
}).meta({ id: 'ToBackendPollUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendPollUserCodexAuthResponse,
  z.infer<typeof zToBackendPollUserCodexAuthResponse>
>({ value: true });
