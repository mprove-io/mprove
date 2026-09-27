import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGenerateUserApiKeyError,
  zToBackendGenerateUserApiKeyError
} from './generate-user-api-key-error';

export type ToBackendGenerateUserApiKeyOutput = {
  apiKey: string;
  apiKeyPrefix: string;
};

export type ToBackendGenerateUserApiKeyResponse = ToBackendResponse<
  ToBackendGenerateUserApiKeyOutput,
  ToBackendGenerateUserApiKeyError
>;

export let zToBackendGenerateUserApiKeyOutput = z
  .object({
    apiKey: z.string(),
    apiKeyPrefix: z.string()
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyOutput' });

export let zToBackendGenerateUserApiKeyResponse = makeToBackendResponseSchema({
  success: zToBackendGenerateUserApiKeyOutput,
  error: zToBackendGenerateUserApiKeyError
}).meta({ id: 'ToBackendGenerateUserApiKeyResponse' });

assertTypesEqual<
  ToBackendGenerateUserApiKeyOutput,
  z.infer<typeof zToBackendGenerateUserApiKeyOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGenerateUserApiKeyResponse,
  z.infer<typeof zToBackendGenerateUserApiKeyResponse>
>({ value: true });
