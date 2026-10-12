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

export type GetAnthropicModelPartsError =
  | BackendLlmModelDiscoveryFailedError
  | BackendProviderNotValidApiKeyError;

export const zGetAnthropicModelPartsError = z.union([
  zBackendLlmModelDiscoveryFailedError,
  zBackendProviderNotValidApiKeyError
]);

assertTypesEqual<
  GetAnthropicModelPartsError,
  z.infer<typeof zGetAnthropicModelPartsError>
>({ value: true });
