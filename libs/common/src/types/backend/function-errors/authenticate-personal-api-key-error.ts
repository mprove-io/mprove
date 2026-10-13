import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiKeyNotFoundError,
  zBackendApiKeyNotFoundError
} from '#common/types/backend/errors/backend-api-key-not-found-error';
import {
  type BackendApiKeyNotValidError,
  zBackendApiKeyNotValidError
} from '#common/types/backend/errors/backend-api-key-not-valid-error';
import {
  type BackendRepoIdDoesNotMatchUserError,
  zBackendRepoIdDoesNotMatchUserError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-user-error';
import {
  type BackendUserApiKeyRequestNotAllowedError,
  zBackendUserApiKeyRequestNotAllowedError
} from '#common/types/backend/errors/backend-user-api-key-request-not-allowed-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type AuthenticatePersonalApiKeyError =
  | UserEntToTabError
  | BackendApiKeyNotFoundError
  | BackendApiKeyNotValidError
  | BackendUserApiKeyRequestNotAllowedError
  | BackendRepoIdDoesNotMatchUserError;

export const zAuthenticatePersonalApiKeyError = z.union([
  zUserEntToTabError,
  zBackendApiKeyNotFoundError,
  zBackendApiKeyNotValidError,
  zBackendUserApiKeyRequestNotAllowedError,
  zBackendRepoIdDoesNotMatchUserError
]);

assertTypesEqual<
  AuthenticatePersonalApiKeyError,
  z.infer<typeof zAuthenticatePersonalApiKeyError>
>({ value: true });
