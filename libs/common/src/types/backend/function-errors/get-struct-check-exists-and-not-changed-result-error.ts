import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendStructIdChangedError,
  zBackendStructIdChangedError
} from '#common/types/backend/errors/backend-struct-id-changed-error';
import {
  type GetStructCheckExistsResultError,
  zGetStructCheckExistsResultError
} from '#common/types/backend/function-errors/get-struct-check-exists-result-error';

export type GetStructCheckExistsAndNotChangedResultError =
  | BackendStructIdChangedError
  | GetStructCheckExistsResultError;

export let zGetStructCheckExistsAndNotChangedResultError = z.union([
  zBackendStructIdChangedError,
  zGetStructCheckExistsResultError
]);

assertTypesEqual<
  GetStructCheckExistsAndNotChangedResultError,
  z.infer<typeof zGetStructCheckExistsAndNotChangedResultError>
>({ value: true });
