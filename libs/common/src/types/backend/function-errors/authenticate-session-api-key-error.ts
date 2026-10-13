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
  type BackendBranchIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-branch-id-does-not-match-session-error';
import {
  type BackendEnvIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-env-id-does-not-match-session-error';
import {
  type BackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-session-error';
import {
  type BackendSessionApiKeyRequestNotAllowedError,
  zBackendSessionApiKeyRequestNotAllowedError
} from '#common/types/backend/errors/backend-session-api-key-request-not-allowed-error';
import {
  type SessionEntToTabError,
  zSessionEntToTabError
} from '#common/types/backend/function-errors/session-ent-to-tab-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type AuthenticateSessionApiKeyError =
  | SessionEntToTabError
  | UserEntToTabError
  | BackendApiKeyNotFoundError
  | BackendApiKeyNotValidError
  | BackendSessionApiKeyRequestNotAllowedError
  | BackendRepoIdDoesNotMatchSessionError
  | BackendEnvIdDoesNotMatchSessionError
  | BackendBranchIdDoesNotMatchSessionError;

export const zAuthenticateSessionApiKeyError = z.union([
  zSessionEntToTabError,
  zUserEntToTabError,
  zBackendApiKeyNotFoundError,
  zBackendApiKeyNotValidError,
  zBackendSessionApiKeyRequestNotAllowedError,
  zBackendRepoIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
]);

assertTypesEqual<
  AuthenticateSessionApiKeyError,
  z.infer<typeof zAuthenticateSessionApiKeyError>
>({ value: true });
