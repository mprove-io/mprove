import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendNotAuthorizedError,
  zBackendNotAuthorizedError
} from '#common/types/backend/errors/backend-not-authorized-error';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/types/backend/errors/backend-user-does-not-exist-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type AuthenticateJwtError =
  | UserEntToTabError
  | BackendUserDoesNotExistError
  | BackendNotAuthorizedError;

export const zAuthenticateJwtError = z.union([
  zUserEntToTabError,
  zBackendUserDoesNotExistError,
  zBackendNotAuthorizedError
]);

assertTypesEqual<AuthenticateJwtError, z.infer<typeof zAuthenticateJwtError>>({
  value: true
});
