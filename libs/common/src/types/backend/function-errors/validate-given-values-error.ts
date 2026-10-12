import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongGivenValueError,
  zBackendWrongGivenValueError
} from '#common/types/backend/errors/backend-wrong-given-value-error';

export type ValidateGivenValuesError = BackendWrongGivenValueError;

export let zValidateGivenValuesError = zBackendWrongGivenValueError;

assertTypesEqual<
  ValidateGivenValuesError,
  z.infer<typeof zValidateGivenValuesError>
>({ value: true });
