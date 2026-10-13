import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';

export type ValidateExpiresInError =
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError;

export let zValidateExpiresInError = z.union([
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
]);

assertTypesEqual<
  ValidateExpiresInError,
  z.infer<typeof zValidateExpiresInError>
>({ value: true });
