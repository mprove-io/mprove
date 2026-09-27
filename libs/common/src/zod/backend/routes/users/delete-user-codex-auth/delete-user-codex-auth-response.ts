import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendDeleteUserCodexAuthError,
  zToBackendDeleteUserCodexAuthError
} from './delete-user-codex-auth-error';

export type ToBackendDeleteUserCodexAuthOutput = {
  user: User;
};

export type ToBackendDeleteUserCodexAuthResponse = ToBackendResponse<
  ToBackendDeleteUserCodexAuthOutput,
  ToBackendDeleteUserCodexAuthError
>;

export let zToBackendDeleteUserCodexAuthOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthOutput' });

export let zToBackendDeleteUserCodexAuthResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteUserCodexAuthOutput,
  error: zToBackendDeleteUserCodexAuthError
}).meta({ id: 'ToBackendDeleteUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthOutput,
  z.infer<typeof zToBackendDeleteUserCodexAuthOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthResponse,
  z.infer<typeof zToBackendDeleteUserCodexAuthResponse>
>({ value: true });
