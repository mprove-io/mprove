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
  type GetAnthropicModelPartsResultError,
  zGetAnthropicModelPartsResultError
} from '#common/types/backend/function-errors/get-anthropic-model-parts-result-error';

export type GetModelPartsResultError =
  | BackendProviderApiKeyRequiredError
  | BackendLlmModelDiscoveryFailedError
  | BackendProviderNotValidApiKeyError
  | GetAnthropicModelPartsResultError;

export const zGetModelPartsResultError = z.union([
  zBackendProviderApiKeyRequiredError,
  zBackendLlmModelDiscoveryFailedError,
  zBackendProviderNotValidApiKeyError,
  zGetAnthropicModelPartsResultError
]);

assertTypesEqual<
  GetModelPartsResultError,
  z.infer<typeof zGetModelPartsResultError>
>({ value: true });
