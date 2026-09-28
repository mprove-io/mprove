import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteUserApiKeyOutput,
  zToBackendDeleteUserApiKeyOutput
} from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-output';
import {
  type ToBackendDeleteUserApiKeyError,
  zToBackendDeleteUserApiKeyError
} from './delete-user-api-key-error';

export type ToBackendDeleteUserApiKeyResponse = ToBackendResponseBase<
  'deleteUserApiKey',
  ToBackendDeleteUserApiKeyOutput,
  ToBackendDeleteUserApiKeyError
>;

export let zToBackendDeleteUserApiKeyResponse = makeToBackendResponseSchema({
  operation: 'deleteUserApiKey',
  output: zToBackendDeleteUserApiKeyOutput,
  error: zToBackendDeleteUserApiKeyError
}).meta({ id: 'ToBackendDeleteUserApiKeyResponse' });

assertTypesEqual<
  ToBackendDeleteUserApiKeyResponse,
  z.infer<typeof zToBackendDeleteUserApiKeyResponse>
>({ value: true });
