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

export type ValidateManualModelLimitsResultError =
  | BackendLlmModelContextLimitRequiredError
  | BackendLlmModelLimitInvalidError;

export const zValidateManualModelLimitsResultError = z.union([
  zBackendLlmModelContextLimitRequiredError,
  zBackendLlmModelLimitInvalidError
]);

assertTypesEqual<
  ValidateManualModelLimitsResultError,
  z.infer<typeof zValidateManualModelLimitsResultError>
>({ value: true });
