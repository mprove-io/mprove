import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';

export type PersistRefreshedTokensError =
  | GetUserCheckExistsError
  | DbErrorToError;

export let zPersistRefreshedTokensError = z.union([
  zGetUserCheckExistsError,
  zDbErrorToError
]);

assertTypesEqual<
  PersistRefreshedTokensError,
  z.infer<typeof zPersistRefreshedTokensError>
>({ value: true });
