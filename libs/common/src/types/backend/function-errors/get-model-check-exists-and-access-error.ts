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
  type GetModelCheckExistsError,
  zGetModelCheckExistsError
} from '#common/types/backend/function-errors/get-model-check-exists-error';

export type GetModelCheckExistsAndAccessError =
  | BackendModelIdIsNotDefinedError
  | BackendForbiddenModelError
  | GetModelCheckExistsError;

export let zGetModelCheckExistsAndAccessError = z.union([
  zBackendModelIdIsNotDefinedError,
  zBackendForbiddenModelError,
  zGetModelCheckExistsError
]);

assertTypesEqual<
  GetModelCheckExistsAndAccessError,
  z.infer<typeof zGetModelCheckExistsAndAccessError>
>({ value: true });
