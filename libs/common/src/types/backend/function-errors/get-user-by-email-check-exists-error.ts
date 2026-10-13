import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/types/backend/errors/backend-user-does-not-exist-error';
import {
  type GetDconfigHashSecretError,
  zGetDconfigHashSecretError
} from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type GetUserByEmailCheckExistsError =
  | GetDconfigHashSecretError
  | MakeHashError
  | UserEntToTabError
  | BackendUserDoesNotExistError;

export const zGetUserByEmailCheckExistsError = z.union([
  zGetDconfigHashSecretError,
  zMakeHashError,
  zUserEntToTabError,
  zBackendUserDoesNotExistError
]);

assertTypesEqual<
  GetUserByEmailCheckExistsError,
  z.infer<typeof zGetUserByEmailCheckExistsError>
>({ value: true });
