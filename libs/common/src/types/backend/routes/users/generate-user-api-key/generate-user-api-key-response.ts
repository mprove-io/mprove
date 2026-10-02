import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGenerateUserApiKeyOutput,
  zToBackendGenerateUserApiKeyOutput
} from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-output';
import {
  type ToBackendGenerateUserApiKeyError,
  zToBackendGenerateUserApiKeyError
} from './generate-user-api-key-error';

export type ToBackendGenerateUserApiKeyResponse = ToBackendResponseBase<
  'generateUserApiKey',
  ToBackendGenerateUserApiKeyOutput,
  ToBackendGenerateUserApiKeyError
>;

export let zToBackendGenerateUserApiKeyResponse = makeToBackendResponseSchema({
  operation: 'generateUserApiKey',
  output: zToBackendGenerateUserApiKeyOutput,
  error: zToBackendGenerateUserApiKeyError
}).meta({ id: 'ToBackendGenerateUserApiKeyResponse' });

assertTypesEqual<
  ToBackendGenerateUserApiKeyResponse,
  z.infer<typeof zToBackendGenerateUserApiKeyResponse>
>({ value: true });
