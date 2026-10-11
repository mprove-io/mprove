import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/types/backend/errors/backend-forbidden-model-error';
import {
  type BackendModelIdIsNotDefinedError,
  zBackendModelIdIsNotDefinedError
} from '#common/types/backend/errors/backend-model-id-is-not-defined-error';
import {
  type GetModelCheckExistsResultError,
  zGetModelCheckExistsResultError
} from '#common/types/backend/function-errors/get-model-check-exists-result-error';

export type GetModelCheckExistsAndAccessResultError =
  | BackendModelIdIsNotDefinedError
  | BackendForbiddenModelError
  | GetModelCheckExistsResultError;

export let zGetModelCheckExistsAndAccessResultError = z.union([
  zBackendModelIdIsNotDefinedError,
  zBackendForbiddenModelError,
  zGetModelCheckExistsResultError
]);

assertTypesEqual<
  GetModelCheckExistsAndAccessResultError,
  z.infer<typeof zGetModelCheckExistsAndAccessResultError>
>({ value: true });
