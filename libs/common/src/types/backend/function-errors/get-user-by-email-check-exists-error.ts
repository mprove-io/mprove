import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbUsersFindFirstCheckExistsError,
  zDbUsersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';
import {
  type GetDconfigHashSecretError,
  zGetDconfigHashSecretError
} from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type GetUserByEmailCheckExistsError =
  | GetDconfigHashSecretError
  | MakeHashError
  | DbUsersFindFirstCheckExistsError;

export const zGetUserByEmailCheckExistsError = z.union([
  zGetDconfigHashSecretError,
  zMakeHashError,
  zDbUsersFindFirstCheckExistsError
]);

assertTypesEqual<
  GetUserByEmailCheckExistsError,
  z.infer<typeof zGetUserByEmailCheckExistsError>
>({ value: true });
