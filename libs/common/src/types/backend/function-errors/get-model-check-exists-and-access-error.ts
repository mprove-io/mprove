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
  type DbModelsFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';

export type GetModelCheckExistsAndAccessError =
  | BackendModelIdIsNotDefinedError
  | BackendForbiddenModelError
  | DbModelsFindFirstCheckExistsError;

export let zGetModelCheckExistsAndAccessError = z.union([
  zBackendModelIdIsNotDefinedError,
  zBackendForbiddenModelError,
  zDbModelsFindFirstCheckExistsError
]);

assertTypesEqual<
  GetModelCheckExistsAndAccessError,
  z.infer<typeof zGetModelCheckExistsAndAccessError>
>({ value: true });
