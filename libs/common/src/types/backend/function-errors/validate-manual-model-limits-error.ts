import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelContextLimitRequiredError,
  zBackendLlmModelContextLimitRequiredError
} from '#common/types/backend/errors/backend-llm-model-context-limit-required-error';
import {
  type BackendLlmModelLimitInvalidError,
  zBackendLlmModelLimitInvalidError
} from '#common/types/backend/errors/backend-llm-model-limit-invalid-error';

export type ValidateManualModelLimitsError =
  | BackendLlmModelContextLimitRequiredError
  | BackendLlmModelLimitInvalidError;

export const zValidateManualModelLimitsError = z.union([
  zBackendLlmModelContextLimitRequiredError,
  zBackendLlmModelLimitInvalidError
]);

assertTypesEqual<
  ValidateManualModelLimitsError,
  z.infer<typeof zValidateManualModelLimitsError>
>({ value: true });
