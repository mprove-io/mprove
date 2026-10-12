import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelDiscoveryFailedError,
  zBackendLlmModelDiscoveryFailedError
} from '#common/types/backend/errors/backend-llm-model-discovery-failed-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/types/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendProviderNotValidApiKeyError,
  zBackendProviderNotValidApiKeyError
} from '#common/types/backend/errors/backend-provider-not-valid-api-key-error';
import {
  type GetAnthropicModelPartsError,
  zGetAnthropicModelPartsError
} from '#common/types/backend/function-errors/get-anthropic-model-parts-error';

export type GetModelPartsError =
  | BackendProviderApiKeyRequiredError
  | BackendLlmModelDiscoveryFailedError
  | BackendProviderNotValidApiKeyError
  | GetAnthropicModelPartsError;

export const zGetModelPartsError = z.union([
  zBackendProviderApiKeyRequiredError,
  zBackendLlmModelDiscoveryFailedError,
  zBackendProviderNotValidApiKeyError,
  zGetAnthropicModelPartsError
]);

assertTypesEqual<GetModelPartsError, z.infer<typeof zGetModelPartsError>>({
  value: true
});
