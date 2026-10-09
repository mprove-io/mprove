import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongGivenValueError,
  zBackendWrongGivenValueError
} from '#common/types/backend/errors/backend-wrong-given-value-error';

export type ValidateGivenValuesResultError = BackendWrongGivenValueError;

export let zValidateGivenValuesResultError = zBackendWrongGivenValueError;

assertTypesEqual<
  ValidateGivenValuesResultError,
  z.infer<typeof zValidateGivenValuesResultError>
>({ value: true });
