import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelVariantsInvalidError,
  zBackendLlmModelVariantsInvalidError
} from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';

export type ValidateModelVariantsError = BackendLlmModelVariantsInvalidError;

export const zValidateModelVariantsError = zBackendLlmModelVariantsInvalidError;

assertTypesEqual<
  ValidateModelVariantsError,
  z.infer<typeof zValidateModelVariantsError>
>({ value: true });
