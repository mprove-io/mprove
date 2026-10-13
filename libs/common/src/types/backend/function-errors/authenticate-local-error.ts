import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongPasswordError,
  zBackendWrongPasswordError
} from '#common/types/backend/errors/backend-wrong-password-error';
import {
  type CheckUserPasswordHashIsDefinedError,
  zCheckUserPasswordHashIsDefinedError
} from '#common/types/backend/function-errors/check-user-password-hash-is-defined-error';
import {
  type GetUserByEmailCheckExistsError,
  zGetUserByEmailCheckExistsError
} from '#common/types/backend/function-errors/get-user-by-email-check-exists-error';

export type AuthenticateLocalError =
  | GetUserByEmailCheckExistsError
  | CheckUserPasswordHashIsDefinedError
  | BackendWrongPasswordError;

export const zAuthenticateLocalError = z.union([
  zGetUserByEmailCheckExistsError,
  zCheckUserPasswordHashIsDefinedError,
  zBackendWrongPasswordError
]);

assertTypesEqual<
  AuthenticateLocalError,
  z.infer<typeof zAuthenticateLocalError>
>({
  value: true
});
