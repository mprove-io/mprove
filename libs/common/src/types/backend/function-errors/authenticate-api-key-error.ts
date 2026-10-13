import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiKeyNotFoundError,
  zBackendApiKeyNotFoundError
} from '#common/types/backend/errors/backend-api-key-not-found-error';
import {
  type AuthenticatePersonalApiKeyError,
  zAuthenticatePersonalApiKeyError
} from '#common/types/backend/function-errors/authenticate-personal-api-key-error';
import {
  type AuthenticateSessionApiKeyError,
  zAuthenticateSessionApiKeyError
} from '#common/types/backend/function-errors/authenticate-session-api-key-error';
import {
  type ParseApiKeyError,
  zParseApiKeyError
} from '#common/types/backend/function-errors/parse-api-key-error';

export type AuthenticateApiKeyError =
  | ParseApiKeyError
  | BackendApiKeyNotFoundError
  | AuthenticatePersonalApiKeyError
  | AuthenticateSessionApiKeyError;

export const zAuthenticateApiKeyError = z.union([
  zParseApiKeyError,
  zBackendApiKeyNotFoundError,
  zAuthenticatePersonalApiKeyError,
  zAuthenticateSessionApiKeyError
]);

assertTypesEqual<
  AuthenticateApiKeyError,
  z.infer<typeof zAuthenticateApiKeyError>
>({
  value: true
});
