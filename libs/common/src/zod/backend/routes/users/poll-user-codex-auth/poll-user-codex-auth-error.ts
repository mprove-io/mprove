import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
import {
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/zod/backend/errors/backend-codex-device-auth-start-failed-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/zod/backend/errors/backend-restricted-user-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendPollUserCodexAuthError =
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendCodexDeviceAuthStartFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendTransactionRetryError;

export let zToBackendPollUserCodexAuthError = z.discriminatedUnion('code', [
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexDeviceAuthStartFailedError,
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendPollUserCodexAuthError,
  z.infer<typeof zToBackendPollUserCodexAuthError>
>({ value: true });
