import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendNotAuthorizedError,
  zBackendNotAuthorizedError
} from '#common/types/backend/errors/backend-not-authorized-error';
import {
  type DbUsersFindFirstCheckExistsError,
  zDbUsersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';

export type AuthenticateJwtError =
  | BackendNotAuthorizedError
  | DbUsersFindFirstCheckExistsError;

export const zAuthenticateJwtError = z.union([
  zBackendNotAuthorizedError,
  zDbUsersFindFirstCheckExistsError
]);

assertTypesEqual<AuthenticateJwtError, z.infer<typeof zAuthenticateJwtError>>({
  value: true
});
