import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteUserApiKeyError,
  zToBackendDeleteUserApiKeyError
} from './delete-user-api-key-error';

export type ToBackendDeleteUserApiKeyOutput = Record<string, never>;

export type ToBackendDeleteUserApiKeyResponse = ToBackendResponse<
  ToBackendDeleteUserApiKeyOutput,
  ToBackendDeleteUserApiKeyError
>;

export let zToBackendDeleteUserApiKeyOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserApiKeyOutput' });

export let zToBackendDeleteUserApiKeyResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteUserApiKeyOutput,
  error: zToBackendDeleteUserApiKeyError
}).meta({ id: 'ToBackendDeleteUserApiKeyResponse' });

assertTypesEqual<
  ToBackendDeleteUserApiKeyOutput,
  z.infer<typeof zToBackendDeleteUserApiKeyOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserApiKeyResponse,
  z.infer<typeof zToBackendDeleteUserApiKeyResponse>
>({ value: true });
