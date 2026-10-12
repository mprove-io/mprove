import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendStructIdChangedError,
  zBackendStructIdChangedError
} from '#common/types/backend/errors/backend-struct-id-changed-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type GetStructCheckExistsAndNotChangedError =
  | BackendStructIdChangedError
  | GetStructCheckExistsError;

export let zGetStructCheckExistsAndNotChangedError = z.union([
  zBackendStructIdChangedError,
  zGetStructCheckExistsError
]);

assertTypesEqual<
  GetStructCheckExistsAndNotChangedError,
  z.infer<typeof zGetStructCheckExistsAndNotChangedError>
>({ value: true });
