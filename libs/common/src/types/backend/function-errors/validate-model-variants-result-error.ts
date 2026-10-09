import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelVariantsInvalidError,
  zBackendLlmModelVariantsInvalidError
} from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';

export type ValidateModelVariantsResultError =
  BackendLlmModelVariantsInvalidError;

export const zValidateModelVariantsResultError =
  zBackendLlmModelVariantsInvalidError;

assertTypesEqual<
  ValidateModelVariantsResultError,
  z.infer<typeof zValidateModelVariantsResultError>
>({ value: true });
