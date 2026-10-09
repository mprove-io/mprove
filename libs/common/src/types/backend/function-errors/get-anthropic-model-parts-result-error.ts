import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelDiscoveryFailedError,
  zBackendLlmModelDiscoveryFailedError
} from '#common/types/backend/errors/backend-llm-model-discovery-failed-error';
import {
  type BackendProviderNotValidApiKeyError,
  zBackendProviderNotValidApiKeyError
} from '#common/types/backend/errors/backend-provider-not-valid-api-key-error';

export type GetAnthropicModelPartsResultError =
  | BackendLlmModelDiscoveryFailedError
  | BackendProviderNotValidApiKeyError;

export const zGetAnthropicModelPartsResultError = z.union([
  zBackendLlmModelDiscoveryFailedError,
  zBackendProviderNotValidApiKeyError
]);

assertTypesEqual<
  GetAnthropicModelPartsResultError,
  z.infer<typeof zGetAnthropicModelPartsResultError>
>({ value: true });
